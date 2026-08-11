const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/booking.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { createBookingValidator } = require('../validators/booking.validator');
const validate = require('../middleware/validate');

// All booking routes require authentication as CUSTOMER
router.use(authMiddleware);
router.use(roleMiddleware('CUSTOMER'));

// POST /api/bookings — Create booking
router.post('/', createBookingValidator, validate, createBooking);

// GET /api/bookings/my — Customer's booking history
router.get('/my', getMyBookings);

// GET /api/bookings/:id — Booking detail
router.get('/:id', getBookingById);

// PATCH /api/bookings/:id/cancel — Cancel booking
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
