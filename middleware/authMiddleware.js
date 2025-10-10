const User = require("../model/user.js");
const { verifyToken } = require("../utils/token.js");

/**
 * Authentication middleware (reads JWT from cookies)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // ✅ Get token from cookies (set as HttpOnly cookie)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token found" });
    }

    // ✅ Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // ✅ Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;

    // ✅ Handle impersonation if present
    if (decoded.impersonatedBy) {
      req.user.isImpersonated = true;
      req.user.impersonatedBy = decoded.impersonatedBy;
    }

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles }; // 👈 Export directly (no object)
