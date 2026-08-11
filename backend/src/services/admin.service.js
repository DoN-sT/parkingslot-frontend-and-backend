const User = require('../models/User');
const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');

/**
 * Admin dashboard overview.
 */
const getDashboard = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalOwners,
    totalEmployees,
    totalParking,
    totalSlots,
    totalBookings,
    activeBookings,
    totalPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'CUSTOMER' }),
    User.countDocuments({ role: 'OWNER' }),
    User.countDocuments({ role: 'EMPLOYEE' }),
    Parking.countDocuments(),
    ParkingSlot.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'ACTIVE' }),
    Payment.countDocuments({ status: 'PAID' }),
  ]);

  // Revenue
  const paidPayments = await Payment.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = paidPayments.length > 0 ? paidPayments[0].total : 0;

  // Occupancy
  const occupiedSlots = await ParkingSlot.countDocuments({
    status: { $in: ['RESERVED', 'OCCUPIED'] },
  });

  return {
    totalUsers,
    totalCustomers,
    totalOwners,
    totalEmployees,
    totalParking,
    totalSlots,
    totalBookings,
    activeBookings,
    totalRevenue,
    occupancy:
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
  };
};

/**
 * Get all users with filters.
 */
const getUsers = async (query) => {
  const { page = 1, limit = 20, role, status, search } = query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get all owners.
 */
const getOwners = async (query) => {
  const { page = 1, limit = 20, status } = query;
  const filter = { role: 'OWNER' };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [owners, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return {
    owners,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Approve an owner registration.
 */
const approveOwner = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role !== 'OWNER') {
    throw ApiError.badRequest('User is not an owner');
  }
  if (user.status !== 'PENDING') {
    throw ApiError.badRequest(`Owner status is already ${user.status}`);
  }

  user.status = 'ACTIVE';
  await user.save();
  return user;
};

/**
 * Reject an owner registration.
 */
const rejectOwner = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role !== 'OWNER') {
    throw ApiError.badRequest('User is not an owner');
  }

  user.status = 'INACTIVE';
  await user.save();
  return user;
};

/**
 * Change user status (Admin).
 */
const updateUserStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'ADMIN') {
    throw ApiError.forbidden('Cannot change status of another admin');
  }

  user.status = status;
  await user.save();
  return user;
};

/**
 * Get all parking (Admin view).
 */
const getAllParking = async (query) => {
  const { page = 1, limit = 20, status } = query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [parking, total] = await Promise.all([
    Parking.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Parking.countDocuments(filter),
  ]);

  return {
    parking,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get all bookings (Admin view).
 */
const getAllBookings = async (query) => {
  const { page = 1, limit = 20, status } = query;
  const filter = {};
  if (status) filter.bookingStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customerId', 'name email')
      .populate('parkingId', 'name address')
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
 * Get all payments (Admin view).
 */
const getAllPayments = async (query) => {
  const { page = 1, limit = 20, status } = query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('bookingId', 'bookingId')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Admin analytics.
 */
const getAnalytics = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalOwners,
    totalEmployees,
    parkingFacilities,
    pendingApprovals,
    totalSlots,
    totalBookings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'CUSTOMER' }),
    User.countDocuments({ role: 'OWNER' }),
    User.countDocuments({ role: 'EMPLOYEE' }),
    Parking.countDocuments(),
    Parking.countDocuments({ status: 'PENDING' }),
    ParkingSlot.countDocuments(),
    Booking.countDocuments(),
  ]);

  const revenueAgg = await Payment.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  const occupiedSlots = await ParkingSlot.countDocuments({
    status: { $in: ['RESERVED', 'OCCUPIED'] },
  });
  const occupancy =
    totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  return {
    totalUsers,
    totalCustomers,
    totalOwners,
    totalEmployees,
    totalFacilities: parkingFacilities,
    parkingFacilities,
    pendingApprovals,
    totalSlots,
    totalBookings,
    totalRevenue: revenue,
    revenue,
    occupancy,
    recentActivity: [],
  };
};

/**
 * Get all pending parking facilities (Admin approval view).
 */
const getPendingParking = async (query) => {
  const { page = 1, limit = 20 } = query;
  const filter = { status: 'PENDING' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [parking, total] = await Promise.all([
    Parking.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Parking.countDocuments(filter),
  ]);

  // Format to match frontend fields (fac.id, fac.totalSlotsCount/fac.totalSlots)
  const formattedParking = parking.map((p) => {
    const plain = p.toObject();
    return {
      ...plain,
      id: p._id.toString(),
      totalSlotsCount: p.totalSlots,
    };
  });

  return formattedParking;
};

/**
 * Approve a pending parking facility.
 */
const approveParking = async (parkingId) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  parking.status = 'ACTIVE';
  await parking.save();
  return parking;
};

/**
 * Reject a pending parking facility.
 */
const rejectParking = async (parkingId) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  parking.status = 'INACTIVE';
  await parking.save();
  return parking;
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
