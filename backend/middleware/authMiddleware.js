// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select("-password");
//       req.user.role = decoded.role;

//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }
// };


// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied: insufficient permission" });
//     }

//     next();
//   };
// };


import jwt from "jsonwebtoken";
import User from "../models/user.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Find user and populate profileRef if needed
//       req.user = await User.findById(decoded.id)
//         .select("-password")
//         .populate("profileRef", "firstName lastName");
      
//       if (!req.user) {
//         return res.status(401).json({ message: "Not authorized, user not found" });
//       }

//       next();
//     } catch (error) {
//       console.error("Auth middleware error:", error);
//       return res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate("profileRef", "firstName lastName");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied: ${req.user.role} role cannot access this resource` 
      });
    }

    next();
  };
};