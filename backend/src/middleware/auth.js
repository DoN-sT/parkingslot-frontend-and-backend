const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Employee = require('../models/Employee');

/**
 * Authenticate user from Bearer token.
 * Attaches req.user = { userId, role }
 */
const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists.');
    }
    if (user.status === 'SUSPENDED') {
      throw ApiError.forbidden('Your account has been suspended.');
    }
    if (user.status === 'INACTIVE') {
      throw ApiError.forbidden('Your account is inactive.');
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired.'));
    }
    next(error);
  }
};

/**
 * Restrict access to specific roles.
 * Must be used AFTER authMiddleware.
 * @param  {...string} roles - Allowed roles (ADMIN, OWNER, EMPLOYEE, CUSTOMER)
 */
const roleMiddleware = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
    }
    next();
  };
};

/**
 * Verify Employee has specific permission.
 * Must be used AFTER authMiddleware & roleMiddleware('EMPLOYEE').
 * Attaches req.employee with the employee record.
 * @param {string} permission - One of: scanQR, verifyEntry, verifyExit, viewBookings
 */
const permissionMiddleware = (permission) => {
  return async (req, _res, next) => {
    try {
      const employee = await Employee.findOne({
        userId: req.user.userId,
      }).populate('parkingId');

      if (!employee) {
        throw ApiError.forbidden('Employee record not found.');
      }

      if (employee.status !== 'ACTIVE') {
        throw ApiError.forbidden('Your employee account is not active.');
      }

      if (permission && !employee.permissions[permission]) {
        throw ApiError.forbidden(
          `You do not have the '${permission}' permission.`
        );
      }

      req.employee = employee;
      next();
    } catch (error) {
      if (error instanceof ApiError) return next(error);
      next(error);
    }
  };
};

module.exports = { authMiddleware, roleMiddleware, permissionMiddleware };
