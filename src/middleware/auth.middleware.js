const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

/**
 * Authentication Middleware
 * Protects routes by verifying the JWT token in the Authorization header.
 * If valid, attaches the decoded user payload (without the password) to req.user.
 */
exports.protect = async (req, res, next) => {
  let token;

  // Expect header format: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new ApiError(401, 'User not found - token invalid'));
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
};

/**
 * Role-based Authorization Middleware
 * Restricts access to users with a specific role (e.g., 'admin').
 * Must be used AFTER the protect middleware.
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role '${req.user?.role}' is not authorized to access this route`)
      );
    }
    next();
  };
};
