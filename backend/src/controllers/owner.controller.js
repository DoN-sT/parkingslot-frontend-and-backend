const parkingService = require('../services/parking.service');
const bookingService = require('../services/booking.service');
const employeeService = require('../services/employee.service');
const ApiResponse = require('../utils/ApiResponse');

// ======================== PARKING MANAGEMENT ========================

const createParking = async (req, res, next) => {
  try {
    const parking = await parkingService.createParking(
      req.user.userId,
      req.body
    );
    return ApiResponse.created(res, 'Parking facility created', parking);
  } catch (error) {
    next(error);
  }
};

const updateParking = async (req, res, next) => {
  try {
    const parking = await parkingService.updateParking(
      req.params.id,
      req.user.userId,
      req.body
    );
    return ApiResponse.ok(res, 'Parking facility updated', parking);
  } catch (error) {
    next(error);
  }
};

const deleteParking = async (req, res, next) => {
  try {
    const result = await parkingService.deleteParking(
      req.params.id,
      req.user.userId
    );
    return ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

const getMyParking = async (req, res, next) => {
  try {
    const parking = await parkingService.getOwnerParking(req.user.userId);
    return ApiResponse.ok(res, 'Your parking facilities retrieved', parking);
  } catch (error) {
    next(error);
  }
};

// ======================== SLOT MANAGEMENT ========================

const addSlots = async (req, res, next) => {
  try {
    // Support both single and bulk slot creation
    if (Array.isArray(req.body.slots)) {
      const slots = await parkingService.addBulkSlots(
        req.params.parkingId,
        req.user.userId,
        req.body.slots
      );
      return ApiResponse.created(
        res,
        `${slots.length} slots created`,
        slots
      );
    }
    const slot = await parkingService.addSlot(
      req.params.parkingId,
      req.user.userId,
      req.body
    );
    return ApiResponse.created(res, 'Slot created', slot);
  } catch (error) {
    next(error);
  }
};

const updateSlot = async (req, res, next) => {
  try {
    const slot = await parkingService.updateSlot(
      req.params.id,
      req.user.userId,
      req.body
    );
    return ApiResponse.ok(res, 'Slot updated', slot);
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    const result = await parkingService.deleteSlot(
      req.params.id,
      req.user.userId
    );
    return ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

// ======================== BOOKINGS & ANALYTICS ========================

const getOwnerBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getOwnerBookings(
      req.user.userId,
      req.query
    );
    return ApiResponse.ok(res, 'Bookings retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getOwnerAnalytics = async (req, res, next) => {
  try {
    const analytics = await bookingService.getOwnerAnalytics(req.user.userId);
    return ApiResponse.ok(res, 'Analytics retrieved', analytics);
  } catch (error) {
    next(error);
  }
};

// ======================== EMPLOYEE MANAGEMENT ========================

const createEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(
      req.user.userId,
      req.body
    );
    return ApiResponse.created(res, 'Employee created', result);
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getOwnerEmployees(
      req.user.userId,
      req.query
    );
    return ApiResponse.ok(res, 'Employees retrieved', employees);
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(
      req.params.id,
      req.user.userId
    );
    return ApiResponse.ok(res, 'Employee retrieved', employee);
  } catch (error) {
    next(error);
  }
};

const verifyEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.verifyEmployee(
      req.params.id,
      req.user.userId
    );
    return ApiResponse.ok(res, 'Employee verified and activated', employee);
  } catch (error) {
    next(error);
  }
};

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      req.user.userId,
      req.body.status
    );
    return ApiResponse.ok(res, 'Employee status updated', employee);
  } catch (error) {
    next(error);
  }
};

const updateEmployeePermissions = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeePermissions(
      req.params.id,
      req.user.userId,
      req.body
    );
    return ApiResponse.ok(res, 'Employee permissions updated', employee);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createParking,
  updateParking,
  deleteParking,
  getMyParking,
  addSlots,
  updateSlot,
  deleteSlot,
  getOwnerBookings,
  getOwnerAnalytics,
  createEmployee,
  getEmployees,
  getEmployeeById,
  verifyEmployee,
  updateEmployeeStatus,
  updateEmployeePermissions,
};
