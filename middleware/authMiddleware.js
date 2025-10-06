const User = require('../model/user.js');
const { verifyToken } = require('../utils/token.js');

/**
 * Basic authentication middleware
 * - Verifies JWT
 * - Attaches user object to request
 * - Handles impersonation if present
 */
const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // ✅ Verify token
      const decoded = verifyToken(token);

      // ✅ Fetch the user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Attach user to request
      req.user = user;

      // ✅ Handle impersonation (optional feature)
      if (decoded.impersonatedBy) {
        req.user.isImpersonated = true;
        req.user.impersonatedBy = decoded.impersonatedBy;
      }

      return next();
    } catch (error) {
      console.error('Error in authMiddleware:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - allowed roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
