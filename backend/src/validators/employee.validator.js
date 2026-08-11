const { body } = require('express-validator');

const createEmployeeValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^\+?[\d\s-]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('parkingId')
    .notEmpty()
    .withMessage('Parking ID is required')
    .isMongoId()
    .withMessage('Invalid parking ID'),
];

const updatePermissionsValidator = [
  body('scanQR').optional().isBoolean().withMessage('scanQR must be boolean'),
  body('verifyEntry')
    .optional()
    .isBoolean()
    .withMessage('verifyEntry must be boolean'),
  body('verifyExit')
    .optional()
    .isBoolean()
    .withMessage('verifyExit must be boolean'),
  body('viewBookings')
    .optional()
    .isBoolean()
    .withMessage('viewBookings must be boolean'),
];

const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be ACTIVE, INACTIVE, or SUSPENDED'),
];

module.exports = {
  createEmployeeValidator,
  updatePermissionsValidator,
  updateStatusValidator,
};
