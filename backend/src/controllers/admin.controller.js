const adminService = require('../services/admin.service');
const ApiResponse = require('../utils/ApiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    return ApiResponse.ok(res, 'Dashboard data retrieved', data);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    return ApiResponse.ok(res, 'Users retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getOwners = async (req, res, next) => {
  try {
    const result = await adminService.getOwners(req.query);
    return ApiResponse.ok(res, 'Owners retrieved', result);
  } catch (error) {
    next(error);
  }
};

const approveOwner = async (req, res, next) => {
  try {
    const user = await adminService.approveOwner(req.params.id);
    return ApiResponse.ok(res, 'Owner approved', user);
  } catch (error) {
    next(error);
  }
};

const rejectOwner = async (req, res, next) => {
  try {
    const user = await adminService.rejectOwner(req.params.id);
    return ApiResponse.ok(res, 'Owner rejected', user);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateUserStatus(
      req.params.id,
      req.body.status
    );
    return ApiResponse.ok(res, 'User status updated', user);
  } catch (error) {
    next(error);
  }
};

const getAllParking = async (req, res, next) => {
  try {
    const result = await adminService.getAllParking(req.query);
    return ApiResponse.ok(res, 'Parking facilities retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const result = await adminService.getAllBookings(req.query);
    return ApiResponse.ok(res, 'Bookings retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const result = await adminService.getAllPayments(req.query);
    return ApiResponse.ok(res, 'Payments retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalytics();
    return ApiResponse.ok(res, 'Analytics retrieved', data);
  } catch (error) {
    next(error);
  }
};

const getPendingParking = async (req, res, next) => {
  try {
    const result = await adminService.getPendingParking(req.query);
    return ApiResponse.ok(res, 'Pending parking facilities retrieved', result);
  } catch (error) {
    next(error);
  }
};

const approveParking = async (req, res, next) => {
  try {
    const parking = await adminService.approveParking(req.params.id);
    return ApiResponse.ok(res, 'Parking facility approved', parking);
  } catch (error) {
    next(error);
  }
};

const rejectParking = async (req, res, next) => {
  try {
    const parking = await adminService.rejectParking(req.params.id);
    return ApiResponse.ok(res, 'Parking facility rejected', parking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getOwners,
  approveOwner,
  rejectOwner,
  updateUserStatus,
  getAllParking,
  getAllBookings,
  getAllPayments,
  getAnalytics,
  getPendingParking,
  approveParking,
  rejectParking,
};
