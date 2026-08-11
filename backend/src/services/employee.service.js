const User = require('../models/User');
const Employee = require('../models/Employee');
const Parking = require('../models/Parking');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const EntryLog = require('../models/EntryLog');
const ApiError = require('../utils/ApiError');

// ======================== OWNER OPERATIONS ========================

/**
 * Create an employee (Owner creates User + Employee records).
 */
const createEmployee = async (ownerId, data) => {
  const { name, email, phone, password, parkingId } = data;

  // Verify parking belongs to this owner
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  // Create User with EMPLOYEE role
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'EMPLOYEE',
    status: 'ACTIVE',
  });

  // Create Employee record
  const employee = await Employee.create({
    userId: user._id,
    ownerId,
    parkingId,
    status: 'PENDING',
    permissions: {
      scanQR: false,
      verifyEntry: false,
      verifyExit: false,
      viewBookings: false,
    },
  });

  return {
    user: user.toJSON(),
    employee,
  };
};

/**
 * List employees owned by this owner.
 */
const getOwnerEmployees = async (ownerId, query) => {
  const { parkingId, status } = query;
  const filter = { ownerId };
  if (parkingId) filter.parkingId = parkingId;
  if (status) filter.status = status;

  const employees = await Employee.find(filter)
    .populate('userId', 'name email phone status')
    .populate('parkingId', 'name address')
    .sort({ createdAt: -1 });

  return employees;
};

/**
 * Get single employee detail (ownership enforced).
 */
const getEmployeeById = async (employeeDbId, ownerId) => {
  const employee = await Employee.findById(employeeDbId)
    .populate('userId', 'name email phone status')
    .populate('parkingId', 'name address');

  if (!employee) {
    throw ApiError.notFound('Employee not found');
  }
  if (employee.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this employee');
  }

  return employee;
};

/**
 * Verify employee (Owner confirms and activates).
 */
const verifyEmployee = async (employeeDbId, ownerId) => {
  const employee = await Employee.findById(employeeDbId);
  if (!employee) {
    throw ApiError.notFound('Employee not found');
  }
  if (employee.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this employee');
  }

  employee.status = 'ACTIVE';
  employee.verifiedAt = new Date();
  await employee.save();

  return employee;
};

/**
 * Update employee status.
 */
const updateEmployeeStatus = async (employeeDbId, ownerId, status) => {
  const employee = await Employee.findById(employeeDbId);
  if (!employee) {
    throw ApiError.notFound('Employee not found');
  }
  if (employee.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this employee');
  }

  employee.status = status;
  await employee.save();

  // Also update User status if suspending/deactivating
  if (status === 'SUSPENDED' || status === 'INACTIVE') {
    await User.findByIdAndUpdate(employee.userId, {
      status: status === 'SUSPENDED' ? 'SUSPENDED' : 'INACTIVE',
    });
  } else if (status === 'ACTIVE') {
    await User.findByIdAndUpdate(employee.userId, { status: 'ACTIVE' });
  }

  return employee;
};

/**
 * Update employee permissions.
 */
const updateEmployeePermissions = async (
  employeeDbId,
  ownerId,
  permissions
) => {
  const employee = await Employee.findById(employeeDbId);
  if (!employee) {
    throw ApiError.notFound('Employee not found');
  }
  if (employee.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this employee');
  }

  // Merge provided permissions
  if (permissions.scanQR !== undefined)
    employee.permissions.scanQR = permissions.scanQR;
  if (permissions.verifyEntry !== undefined)
    employee.permissions.verifyEntry = permissions.verifyEntry;
  if (permissions.verifyExit !== undefined)
    employee.permissions.verifyExit = permissions.verifyExit;
  if (permissions.viewBookings !== undefined)
    employee.permissions.viewBookings = permissions.viewBookings;

  await employee.save();
  return employee;
};

// ======================== EMPLOYEE OPERATIONS ========================

/**
 * Scan QR token — validate everything and return booking info.
 */
const scanQR = async (employeeUserId, qrToken) => {
  // 1. Get employee record
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee) {
    throw ApiError.forbidden('Employee record not found');
  }
  if (employee.status !== 'ACTIVE') {
    throw ApiError.forbidden('Your employee account is not active');
  }
  if (!employee.permissions.scanQR) {
    throw ApiError.forbidden('You do not have the scanQR permission');
  }

  // 2. Find booking by QR token
  const booking = await Booking.findOne({ qrToken })
    .populate('customerId', 'name email phone')
    .populate('parkingId', 'name address ownerId')
    .populate('slotId', 'slotNumber vehicleType');

  if (!booking) {
    throw ApiError.notFound('Invalid QR token — no booking found');
  }

  // 3. Verify booking's parking belongs to employee's assigned parking
  if (booking.parkingId._id.toString() !== employee.parkingId.toString()) {
    throw ApiError.forbidden(
      'This booking is for a different parking facility'
    );
  }

  // 4. Verify payment is PAID
  if (booking.paymentStatus !== 'PAID') {
    throw ApiError.badRequest(`Payment status is ${booking.paymentStatus}`);
  }

  // 5. Verify booking status
  if (!['CONFIRMED', 'ACTIVE'].includes(booking.bookingStatus)) {
    throw ApiError.badRequest(
      `Booking status is ${booking.bookingStatus} — cannot process`
    );
  }

  // 6. Check time window (allow 30 min buffer before start and after end)
  const now = new Date();
  const bufferMs = 30 * 60 * 1000; // 30 minutes
  const earlyStart = new Date(booking.startTime.getTime() - bufferMs);
  const lateEnd = new Date(booking.endTime.getTime() + bufferMs);

  if (now < earlyStart) {
    throw ApiError.badRequest(
      'Too early — booking window has not started yet'
    );
  }
  if (now > lateEnd && booking.bookingStatus !== 'ACTIVE') {
    throw ApiError.badRequest('Booking has expired');
  }

  return {
    booking: {
      _id: booking._id,
      bookingId: booking.bookingId,
      customer: booking.customerId,
      parking: booking.parkingId.name,
      slot: booking.slotId,
      vehicleType: booking.vehicleType,
      vehicleNumber: booking.vehicleNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      entryTime: booking.entryTime,
      exitTime: booking.exitTime,
    },
  };
};

/**
 * Verify entry — CONFIRMED → ACTIVE.
 */
const verifyEntry = async (employeeUserId, bookingDbId) => {
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee || employee.status !== 'ACTIVE') {
    throw ApiError.forbidden('Employee is not active');
  }
  if (!employee.permissions.verifyEntry) {
    throw ApiError.forbidden('You do not have the verifyEntry permission');
  }

  const booking = await Booking.findById(bookingDbId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify booking is for employee's parking
  if (booking.parkingId.toString() !== employee.parkingId.toString()) {
    throw ApiError.forbidden(
      'This booking is for a different parking facility'
    );
  }

  // Must be CONFIRMED
  if (booking.bookingStatus !== 'CONFIRMED') {
    throw ApiError.badRequest(
      `Cannot verify entry — booking status is ${booking.bookingStatus}`
    );
  }
  if (booking.paymentStatus !== 'PAID') {
    throw ApiError.badRequest('Payment is not completed');
  }

  // Update booking: CONFIRMED → ACTIVE
  booking.bookingStatus = 'ACTIVE';
  booking.entryTime = new Date();
  booking.verifiedBy = employeeUserId;
  await booking.save();

  // Update slot: RESERVED → OCCUPIED
  const slot = await ParkingSlot.findById(booking.slotId);
  if (slot) {
    slot.status = 'OCCUPIED';
    await slot.save();
  }

  // Create entry log
  await EntryLog.create({
    bookingId: booking._id,
    customerId: booking.customerId,
    employeeId: employeeUserId,
    parkingId: booking.parkingId,
    action: 'ENTRY',
    result: 'APPROVED',
  });

  return booking;
};

/**
 * Verify exit — ACTIVE → COMPLETED.
 */
const verifyExit = async (employeeUserId, bookingDbId) => {
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee || employee.status !== 'ACTIVE') {
    throw ApiError.forbidden('Employee is not active');
  }
  if (!employee.permissions.verifyExit) {
    throw ApiError.forbidden('You do not have the verifyExit permission');
  }

  const booking = await Booking.findById(bookingDbId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Verify booking is for employee's parking
  if (booking.parkingId.toString() !== employee.parkingId.toString()) {
    throw ApiError.forbidden(
      'This booking is for a different parking facility'
    );
  }

  // Must be ACTIVE
  if (booking.bookingStatus !== 'ACTIVE') {
    throw ApiError.badRequest(
      `Cannot verify exit — booking status is ${booking.bookingStatus}`
    );
  }

  // Update booking: ACTIVE → COMPLETED
  booking.bookingStatus = 'COMPLETED';
  booking.exitTime = new Date();
  await booking.save();

  // Update slot: OCCUPIED → AVAILABLE
  const slot = await ParkingSlot.findById(booking.slotId);
  if (slot) {
    slot.status = 'AVAILABLE';
    slot.currentBookingId = null;
    await slot.save();
  }

  // Create exit log
  await EntryLog.create({
    bookingId: booking._id,
    customerId: booking.customerId,
    employeeId: employeeUserId,
    parkingId: booking.parkingId,
    action: 'EXIT',
    result: 'APPROVED',
  });

  return booking;
};

/**
 * Get bookings for employee's assigned parking.
 */
const getEmployeeBookings = async (employeeUserId, query) => {
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee) {
    throw ApiError.forbidden('Employee record not found');
  }
  if (!employee.permissions.viewBookings) {
    throw ApiError.forbidden('You do not have the viewBookings permission');
  }

  const { page = 1, limit = 20, status } = query;
  const filter = { parkingId: employee.parkingId };
  if (status) filter.bookingStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customerId', 'name email phone')
      .populate('slotId', 'slotNumber vehicleType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get employee's entry/exit activity (EntryLog).
 */
const getEmployeeActivity = async (employeeUserId, query) => {
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee) {
    throw ApiError.forbidden('Employee record not found');
  }

  const { page = 1, limit = 20 } = query;
  const filter = { employeeId: employeeUserId };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    EntryLog.find(filter)
      .populate('bookingId', 'bookingId vehicleNumber')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    EntryLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get active vehicles currently parked (status: ACTIVE) for the employee's assigned parking facility.
 */
const getActiveVehicles = async (employeeUserId) => {
  const employee = await Employee.findOne({ userId: employeeUserId });
  if (!employee) {
    throw ApiError.forbidden('Employee record not found');
  }

  const bookings = await Booking.find({
    parkingId: employee.parkingId,
    bookingStatus: 'ACTIVE',
  })
    .populate('customerId', 'name email phone')
    .populate('slotId', 'slotNumber vehicleType')
    .sort({ entryTime: -1 });

  return bookings.map((b) => ({
    id: b._id || b.bookingId,
    vehicleNumber: b.vehicleNumber,
    slotNumber: b.slotId ? b.slotId.slotNumber : 'N/A',
    customerName: b.customerId ? b.customerId.name : 'Verified Driver',
    entryTime: b.entryTime,
  }));
};

module.exports = {
  createEmployee,
  getOwnerEmployees,
  getEmployeeById,
  verifyEmployee,
  updateEmployeeStatus,
  updateEmployeePermissions,
  scanQR,
  verifyEntry,
  verifyExit,
  getEmployeeBookings,
  getEmployeeActivity,
  getActiveVehicles,
};
