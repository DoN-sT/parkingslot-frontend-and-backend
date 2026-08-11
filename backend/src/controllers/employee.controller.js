const employeeService = require('../services/employee.service');
const ApiResponse = require('../utils/ApiResponse');

const scanQR = async (req, res, next) => {
  try {
    const result = await employeeService.scanQR(
      req.user.userId,
      req.body.qrToken
    );
    return ApiResponse.ok(res, 'QR scan successful', result);
  } catch (error) {
    next(error);
  }
};

const verifyEntry = async (req, res, next) => {
  try {
    const booking = await employeeService.verifyEntry(
      req.user.userId,
      req.body.bookingId
    );
    return ApiResponse.ok(res, 'Entry verified — vehicle checked in', booking);
  } catch (error) {
    next(error);
  }
};

const verifyExit = async (req, res, next) => {
  try {
    const booking = await employeeService.verifyExit(
      req.user.userId,
      req.body.bookingId
    );
    return ApiResponse.ok(res, 'Exit verified — vehicle checked out', booking);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployeeBookings(
      req.user.userId,
      req.query
    );
    return ApiResponse.ok(res, 'Bookings retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployeeActivity(
      req.user.userId,
      req.query
    );
    return ApiResponse.ok(res, 'Activity retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getActiveVehicles = async (req, res, next) => {
  try {
    const result = await employeeService.getActiveVehicles(req.user.userId);
    return ApiResponse.ok(res, 'Active vehicles retrieved', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { scanQR, verifyEntry, verifyExit, getBookings, getActivity, getActiveVehicles };
