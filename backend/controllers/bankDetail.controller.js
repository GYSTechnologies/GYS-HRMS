import BankDetail from "../models/bankDetail.js";
import { encrypt, decrypt } from "../config/encryption.js";

export const addOrUpdateBankDetail = async (req, res) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      accountType,
    } = req.body;
    const employeeId = req.user.profileRef?._id;

    if (!employeeId) {
      return res.status(400).json({ message: "Profile not linked to user" });
    }

    // Validate required fields
    if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate account number format (numbers only, minimum length)
    if (!/^\d+$/.test(accountNumber) || accountNumber.length < 6) {
      return res.status(400).json({ message: "Invalid account number" });
    }

    // Validate IFSC code format (alphanumeric, 11 characters)
    // if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode)) {
    //   return res.status(400).json({ message: "Invalid IFSC code format" });
    // }

    const encrypted = encrypt(accountNumber);
    const last4 = accountNumber.slice(-4);

    const bankDetail = await BankDetail.findOneAndUpdate(
      { employee: employeeId },
      {
        employee: employeeId,
        accountHolderName,
        accountNumberEncrypted: encrypted,
        last4,
        bankName,
        ifscCode: ifscCode.toUpperCase(),
        accountType,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Bank detail saved successfully",
      data: {
        id: bankDetail._id,
        accountHolderName: bankDetail.accountHolderName,
        bankName: bankDetail.bankName,
        ifscCode: bankDetail.ifscCode,
        accountType: bankDetail.accountType,
        last4: bankDetail.last4,
      },
    });
  } catch (err) {
    console.error("addOrUpdateBankDetail error", err);

    // Handle specific encryption errors
    if (
      err.message.includes("Invalid key length") ||
      err.code === "ERR_CRYPTO_INVALID_KEYLEN"
    ) {
      return res
        .status(500)
        .json({ message: "Encryption configuration error" });
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Bank details already exist for this employee" });
    }

    res.status(500).json({ message: err.message || "Server error" });
  }
};

//  Get own Bank Detail
export const getMyBankDetail = async (req, res) => {
  try {
    const employeeId = req.user.profileRef?._id;

    if (!employeeId) {
      return res.status(400).json({ message: "Profile not linked to user" });
    }

    const bankDetail = await BankDetail.findOne({ employee: employeeId });
    if (!bankDetail) {
      return res.status(404).json({ message: "Bank detail not found" });
    }

    res.status(200).json({
      id: bankDetail._id,
      accountHolderName: bankDetail.accountHolderName,
      accountNumber: decrypt(bankDetail.accountNumberEncrypted), // full visible to self
      bankName: bankDetail.bankName,
      ifscCode: bankDetail.ifscCode,
      accountType: bankDetail.accountType,
      last4: bankDetail.last4,
    });
  } catch (err) {
    console.error("getMyBankDetail error", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

//  Get Bank Detail by Employee (Admin/HR only)
export const getEmployeeBankDetail = async (req, res) => {
  try {
    // Only admin or HR can access
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { employeeId } = req.params;

    const bankDetail = await BankDetail.findOne({ employee: employeeId });
    if (!bankDetail) {
      return res.status(404).json({ message: "Bank detail not found" });
    }

    // decrypt full account number
    const accountNumber = decrypt(bankDetail.accountNumberEncrypted);

    res.status(200).json({
      id: bankDetail._id,
      accountHolderName: bankDetail.accountHolderName,
      accountNumber,
      bankName: bankDetail.bankName,
      ifscCode: bankDetail.ifscCode,
      accountType: bankDetail.accountType,
      last4: bankDetail.last4,
    });
  } catch (err) {
    console.error("getEmployeeBankDetail error", err);
    res.status(500).json({ message: "Server error" });
  }
};
