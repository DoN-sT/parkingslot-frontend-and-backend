const { body } = require('express-validator');

const createBookingValidator = [
  body('parkingId')
    .notEmpty()
    .withMessage('Parking ID is required')
    .isMongoId()
    .withMessage('Invalid parking ID'),
  body('slotId')
    .notEmpty()
    .withMessage('Slot ID is required')
    .isMongoId()
    .withMessage('Invalid slot ID'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY'])
    .withMessage('Vehicle type must be TWO_WHEELER, FOUR_WHEELER, or HEAVY'),
  body('vehicleNumber')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required'),
];

module.exports = { createBookingValidator };
