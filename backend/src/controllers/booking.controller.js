const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(
      req.user.userId,
      req.body
    );
    return ApiResponse.created(res, 'Booking created successfully', booking);
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getMyBookings(
      req.user.userId,
      req.query
    );
    return ApiResponse.ok(res, 'Bookings retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    return ApiResponse.ok(res, 'Booking retrieved', booking);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.userId
    );
    return ApiResponse.ok(res, 'Booking cancelled successfully', booking);
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
