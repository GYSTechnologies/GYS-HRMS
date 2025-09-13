import LeaveRequest from "../models/leaves.js";
import LeavePolicy from "../models/leavePolicy.js";
import LeaveType from "../models/leaveType.js";

import User from "../models/user.js";

/**
 * Helpers
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysInclusive(startDate, endDate) {
  // Normalize to UTC midnight to avoid timezone partial-day issues
  const s = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const e = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.floor((e - s) / MS_PER_DAY) + 1;
}

function overlapDays(rangeFrom, rangeTo, boundFrom, boundTo) {
  const start = rangeFrom > boundFrom ? rangeFrom : boundFrom;
  const end = rangeTo < boundTo ? rangeTo : boundTo;
  if (end < start) return 0;
  return daysInclusive(start, end);
}

//computeRemainingForUserAndYear
async function computeRemainingForUserAndYear(userId, year) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const policy = await LeavePolicy.findOne({ role: user.role, year });
  if (!policy) {
    return { policy: null, remaining: null };
  }

  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const approvedLeaves = await LeaveRequest.find({
    employee: userId,
    status: "approved",
    fromDate: { $lte: yearEnd },
    toDate: { $gte: yearStart },
  }).lean();

  const taken = {};
  
  // Initialize all leave types from policy
  if (policy.leaves instanceof Map) {
    for (const [key] of policy.leaves) {
      taken[key] = 0;
    }
  } else {
    // Backward compatibility with old structure
    for (const type of ["casual", "sick", "paid"]) {
      taken[type] = 0;
    }
  }

  for (const l of approvedLeaves) {
    const overlap = overlapDays(new Date(l.fromDate), new Date(l.toDate), yearStart, yearEnd);
    if (overlap <= 0) continue;
    if (!taken[l.leaveType]) taken[l.leaveType] = 0;
    taken[l.leaveType] += overlap;
  }

  const remaining = {};
  if (policy.leaves instanceof Map) {
    for (const [type, allowed] of policy.leaves) {
      remaining[type] = Math.max(0, allowed - (taken[type] || 0));
    }
  } else {
    // Backward compatibility
    for (const type of ["casual", "sick", "paid"]) {
      const allowed = policy.leaves[type] || 0;
      remaining[type] = Math.max(0, allowed - (taken[type] || 0));
    }
  }

  return { policy, remaining };
}

/**
 * Controller: setLeavePolicy (create/update)
 */
export const setLeavePolicy = async (req, res) => {
  try {
    const { role, year, leaves } = req.body; // Now leaves is a dynamic object
    
    if (!role || !year) return res.status(400).json({ message: "role and year are required" });

    let policy = await LeavePolicy.findOne({ role, year });
    
    if (policy) {
      // Update existing policy with new leaves structure
      if (leaves && typeof leaves === 'object') {
        policy.leaves = new Map(Object.entries(leaves));
      }
      await policy.save();
    } else {
      // Create new policy with dynamic leaves
      policy = await LeavePolicy.create({
        role,
        year,
        leaves: leaves ? new Map(Object.entries(leaves)) : new Map()
      });
    }

    res.status(200).json({ message: "Leave policy set successfully", policy });
  } catch (err) {
    res.status(500).json({ message: "Error setting leave policy", error: err.message });
  }
};

/**
 * Controller: getPolicies
 */
export const getPolicies = async (req, res) => {
  try {
    const policies = await LeavePolicy.find();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave policies", error: err.message });
  }
};

/**
 * Controller: getPolicyByRoleYear
 */
export const getPolicyByRoleYear = async (req, res) => {
  try {
    const { role, year } = req.params;
    const policy = await LeavePolicy.findOne({ role, year: Number(year) });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave policy", error: err.message });
  }
};

/**
 * Controller: createLeaveRequest
 * - calculates totalDays
 * - validates against remaining leaves for the year
 * - stores balanceSnapshot (remaining at creation time)
 */
export const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const role = req.user.role;

    if (role === "admin") {
      return res.status(403).json({ message: "Admin cannot request leaves." });
    }

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({ message: "leaveType, fromDate and toDate are required." });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from) || isNaN(to) || to < from) {
      return res.status(400).json({ message: "Invalid fromDate/toDate." });
    }

    const totalDays = daysInclusive(from, to);
    const year = from.getFullYear();

    // compute remaining for that employee & year
    const { policy, remaining } = await computeRemainingForUserAndYear(req.user.id, year);
    if (!policy) {
      return res.status(400).json({ message: `Leave policy not set for role=${req.user.role} year=${year}` });
    }

    if (typeof remaining[leaveType] === "undefined") {
      return res.status(400).json({ message: `Invalid leave type: ${leaveType}` });
    }

    if (totalDays > remaining[leaveType]) {
      return res.status(400).json({
        message: `Requested ${totalDays} days but only ${remaining[leaveType]} ${leaveType} days remain for year ${year}.`,
      });
    }

    const leave = new LeaveRequest({
      employee: req.user.id,
      leaveType,
      fromDate: from,
      toDate: to,
      totalDays,
      reason,
      // snapshot of remaining at the time of request
      balanceSnapshot: {
        year,
        remaining,
      },
    });

    await leave.save();
    // populate employee for response (light)
    await leave.populate("employee", "email role");

    res.status(201).json({ message: "Leave request created", leave });
  } catch (err) {
    res.status(500).json({ message: "Error creating leave request", error: err.message });
  }
};

/**
 * Controller: getLeaveRequests (role-based)
 * - employee: their own
 * - hr: all employee leaves (pending/others) + remaining snapshot per request
 * - admin: all leaves (including HR)
 */
export const getLeaveRequests = async (req, res) => {
  try {
    const role = req.user.role;
    let leaves = [];

    if (role === "employee") {
      leaves = await LeaveRequest.find({ employee: req.user.id }).populate("employee", "email role");
      return res.json(leaves);
    }

    if (role === "hr") {
      // HR should see employee leaves
      const employees = await User.find({ role: "employee" }).select("_id");
      const ids = employees.map((e) => e._id);
      leaves = await LeaveRequest.find({ employee: { $in: ids } }).populate("employee", "email role");
      // attach live remaining for each leave's relevant year/type
      const enhanced = [];
      for (const l of leaves) {
        const startYear = new Date(l.fromDate).getFullYear();
        const { remaining } = await computeRemainingForUserAndYear(l.employee._id, startYear);
        enhanced.push({ ...l.toObject(), currentRemaining: remaining });
      }
      return res.json(enhanced);
    }

    if (role === "admin") {
      leaves = await LeaveRequest.find().populate("employee", "email role");
      // attach live remaining for each leave
      const enhanced = [];
      for (const l of leaves) {
        const startYear = new Date(l.fromDate).getFullYear();
        const { remaining } = await computeRemainingForUserAndYear(l.employee._id, startYear);
        enhanced.push({ ...l.toObject(), currentRemaining: remaining });
      }
      return res.json(enhanced);
    }

    res.status(403).json({ message: "Unauthorized" });
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaves", error: err.message });
  }
};

// Any authenticated user can see their own leaves
export const getMyLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user.id })
      .populate("employee", "email role name")
      .sort({ appliedAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your leaves", error: err.message });
  }
};

 //Controller: approveOrRejectLeave
export const approveOrRejectLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { action, reason } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
    }

    const leave = await LeaveRequest.findById(leaveId).populate("employee", "email role");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Role validation
    if (leave.employee.role === "hr" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can handle HR leave requests" });
    }
    if (leave.employee.role === "employee" && !["hr", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only HR/Admin can handle employee leave requests" });
    }

    if (action === "reject") {
      leave.status = "rejected";
      leave.processedBy = req.user.id;
      leave.processedAt = new Date();
      leave.remarks = reason || null;
      await leave.save();
      return res.json({ message: "Leave rejected", leave });
    }

    // action === 'approve'
    const startYear = new Date(leave.fromDate).getFullYear();
    const { policy, remaining } = await computeRemainingForUserAndYear(leave.employee._id, startYear);
    if (!policy) {
      return res.status(400).json({ message: `Leave policy not set for role=${leave.employee.role} year=${startYear}` });
    }

    if (leave.totalDays > remaining[leave.leaveType]) {
      return res.status(400).json({
        message: `Cannot approve: requested ${leave.totalDays} days but only ${remaining[leave.leaveType]} ${leave.leaveType} days remain for ${startYear}.`,
      });
    }

    leave.status = "approved";
    leave.processedBy = req.user.id;
    leave.processedAt = new Date();
    leave.remarks = reason || null;

    await leave.save();
    res.json({ message: "Leave approved", leave });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave", error: err.message });
  }
};


 // Get leave balance
export const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const currentYear = new Date().getFullYear();

    // Get leave policy for user's role
    const user = await User.findById(userId);
    const policy = await LeavePolicy.findOne({ 
      role: user.role, 
      year: currentYear 
    }).lean();

    if (!policy) {
      return res.status(404).json({ message: "Leave policy not set for your role and current year" });
    }

    // Get approved leaves of user for the current year
    const yearStart = new Date(Date.UTC(currentYear, 0, 1));
    const yearEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
    
    const approvedLeaves = await LeaveRequest.find({ 
      employee: userId, 
      status: "approved",
      fromDate: { $lte: yearEnd },
      toDate: { $gte: yearStart }
    });

    // Calculate taken leaves correctly using totalDays
    const taken = { casual: 0, sick: 0, paid: 0 };
    
    for (const leave of approvedLeaves) {
      const overlap = overlapDays(
        new Date(leave.fromDate), 
        new Date(leave.toDate), 
        yearStart, 
        yearEnd
      );
      taken[leave.leaveType] += overlap;
    }

    // Calculate balance
    const balance = {};
    for (const type in policy.leaves) {
      balance[type] = policy.leaves[type] - (taken[type] || 0);
    }

    res.json({ balance, policy, taken });
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching leave balance", 
      error: err.message 
    });
  }
};


// @desc    Get a single leave request by ID
// @route   GET /api/leave/requests/:id
// @access  Private
export const getSingleLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id).populate("employee", "email").populate("processedBy", "email");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Authorization: Employee can only see their own, HR/Admin can see all
    const isOwner = leave.employee._id.toString() === req.user.id;
    const isManagement = ["hr", "admin"].includes(req.user.role);

    if (!isOwner && !isManagement) {
      return res.status(403).json({ message: "Not authorized to view this leave" });
    }

    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave request", error: err.message });
  }
};

// @desc    Cancel a pending leave request
// @route   PUT /api/leave/requests/:id/cancel
// @access  Private (Employee - can only cancel their own)
export const cancelLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Check ownership
    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this leave" });
    }

    // Check if it's pending
    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Only pending leave requests can be cancelled" });
    }

    leave.status = "cancelled";
    leave.processedBy = req.user.id; // Or null? The user cancelled it themselves.
    leave.processedAt = new Date();
    leave.remarks = "Cancelled by employee";

    await leave.save();
    res.json({ message: "Leave request cancelled successfully", leave });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling leave request", error: err.message });
  }
};

// Create new leave type
export const createLeaveType = async (req, res) => {
  try {
    const { name } = req.body;
    
    const existingType = await LeaveType.findOne({ name: name.toLowerCase().replace(/\s+/g, '_') });
    if (existingType) {
      return res.status(400).json({ message: "Leave type already exists" });
    }

    const leaveType = await LeaveType.create({ name });
    res.status(201).json({ message: "Leave type created successfully", leaveType });
  } catch (err) {
    res.status(500).json({ message: "Error creating leave type", error: err.message });
  }
};

// Get all leave types
export const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ createdAt: -1 });
    res.json(leaveTypes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave types", error: err.message });
  }
};

// Update leave type
export const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const leaveType = await LeaveType.findByIdAndUpdate(
      id,
      { name: name.toLowerCase().replace(/\s+/g, '_') },
      { new: true, runValidators: true }
    );

    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    res.json({ message: "Leave type updated successfully", leaveType });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave type", error: err.message });
  }
};

// Delete leave type
export const deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findByIdAndDelete(id);

    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    res.json({ message: "Leave type deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting leave type", error: err.message });
  }
};

// Toggle leave type status
export const toggleLeaveTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findById(id);

    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    leaveType.isActive = !leaveType.isActive;
    await leaveType.save();

    res.json({ 
      message: `Leave type ${leaveType.isActive ? 'activated' : 'deactivated'} successfully`,
      leaveType 
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave type status", error: err.message });
  }
};