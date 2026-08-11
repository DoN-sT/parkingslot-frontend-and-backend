const { body } = require('express-validator');

const createParkingValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Parking name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('totalSlots')
    .notEmpty()
    .withMessage('Total slots is required')
    .isInt({ min: 1 })
    .withMessage('Total slots must be at least 1'),
  body('pricing.twoWheeler')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Two wheeler pricing must be non-negative'),
  body('pricing.fourWheeler')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Four wheeler pricing must be non-negative'),
  body('pricing.heavy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Heavy vehicle pricing must be non-negative'),
  body('facilities')
    .optional()
    .isArray()
    .withMessage('Facilities must be an array'),
  body('openingTime')
    .notEmpty()
    .withMessage('Opening time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Opening time must be in HH:MM format'),
  body('closingTime')
    .notEmpty()
    .withMessage('Closing time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Closing time must be in HH:MM format'),
];

const updateParkingValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('address').optional().trim(),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('totalSlots')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total slots must be at least 1'),
  body('pricing.twoWheeler')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Two wheeler pricing must be non-negative'),
  body('pricing.fourWheeler')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Four wheeler pricing must be non-negative'),
  body('pricing.heavy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Heavy vehicle pricing must be non-negative'),
  body('openingTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Opening time must be in HH:MM format'),
  body('closingTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Closing time must be in HH:MM format'),
];

const createSlotValidator = [
  body('slotNumber')
    .trim()
    .notEmpty()
    .withMessage('Slot number is required'),
  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY'])
    .withMessage('Vehicle type must be TWO_WHEELER, FOUR_WHEELER, or HEAVY'),
];

const updateSlotValidator = [
  body('slotNumber').optional().trim(),
  body('vehicleType')
    .optional()
    .isIn(['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY'])
    .withMessage('Vehicle type must be TWO_WHEELER, FOUR_WHEELER, or HEAVY'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'])
    .withMessage('Invalid slot status'),
];

module.exports = {
  createParkingValidator,
  updateParkingValidator,
  createSlotValidator,
  updateSlotValidator,
};
