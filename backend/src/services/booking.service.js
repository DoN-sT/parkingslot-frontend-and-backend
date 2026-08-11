const Booking = require('../models/Booking');
const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const ApiError = require('../utils/ApiError');

/**
 * Create a booking (Customer).
 * Validates parking, slot, time, availability; prevents double-booking; calculates amount.
 */
const createBooking = async (customerId, data) => {
  const { parkingId, slotId, startTime, endTime, vehicleType, vehicleNumber } =
    data;

  // 1. Validate parking exists and is active
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.status !== 'ACTIVE') {
    throw ApiError.badRequest('Parking facility is not currently active');
  }

  // 2. Validate slot exists and belongs to this parking
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) {
    throw ApiError.notFound('Parking slot not found');
  }
  if (slot.parkingId.toString() !== parkingId) {
    throw ApiError.badRequest('Slot does not belong to this parking facility');
  }

  // 3. Validate slot type matches vehicle type
  if (slot.vehicleType !== vehicleType) {
    throw ApiError.badRequest(
      `Slot is for ${slot.vehicleType}, but vehicle type is ${vehicleType}`
    );
  }

  // 4. Validate times
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) {
    throw ApiError.badRequest('Start time cannot be in the past');
  }
  if (end <= start) {
    throw ApiError.badRequest('End time must be after start time');
  }

  // 5. Check slot availability (DB is source of truth, NOT frontend state)
  if (slot.status !== 'AVAILABLE') {
    throw ApiError.badRequest(`Slot is currently ${slot.status}`);
  }

  // 6. Prevent double-booking (overlapping time for same slot)
  const overlapping = await Booking.findOne({
    slotId,
    bookingStatus: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });
  if (overlapping) {
    throw ApiError.conflict('This slot is already booked for the requested time');
  }

  // 7. Calculate amount (price per hour × duration)
  const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
  let pricePerHour = 0;
  if (vehicleType === 'TWO_WHEELER') pricePerHour = parking.pricing.twoWheeler;
  else if (vehicleType === 'FOUR_WHEELER')
    pricePerHour = parking.pricing.fourWheeler;
  else if (vehicleType === 'HEAVY') pricePerHour = parking.pricing.heavy;

  const amount = durationHours * pricePerHour;

  // 8. Create booking
  const booking = await Booking.create({
    customerId,
    parkingId,
    slotId,
    startTime: start,
    endTime: end,
    vehicleType,
    vehicleNumber,
    amount,
    paymentStatus: 'PENDING',
    bookingStatus: 'PENDING',
  });

  // 9. Reserve the slot
  slot.status = 'RESERVED';
  slot.currentBookingId = booking._id;
  await slot.save();

  return booking;
};

/**
 * Get customer's booking history.
 */
const getMyBookings = async (customerId, query) => {
  const { page = 1, limit = 20, status } = query;
  const filter = { customerId };
  if (status) filter.bookingStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
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
 * Get a single booking by ID (customer ownership enforced).
 */
const getBookingById = async (bookingDbId, userId, role) => {
  const booking = await Booking.findById(bookingDbId)
    .populate('parkingId', 'name address ownerId pricing')
    .populate('slotId', 'slotNumber vehicleType')
    .populate('customerId', 'name email phone')
    .populate('verifiedBy', 'name');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Enforce ownership: customer can only see their own bookings
  if (role === 'CUSTOMER' && booking.customerId._id.toString() !== userId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  return booking;
};

/**
 * Cancel a booking if eligible.
 * Eligible: PENDING or CONFIRMED status only.
 */
const cancelBooking = async (bookingDbId, customerId) => {
  const booking = await Booking.findById(bookingDbId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Enforce ownership
  if (booking.customerId.toString() !== customerId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  // Only PENDING or CONFIRMED can be cancelled
  if (!['PENDING', 'CONFIRMED'].includes(booking.bookingStatus)) {
    throw ApiError.badRequest(
      `Cannot cancel a booking with status ${booking.bookingStatus}`
    );
  }

  booking.bookingStatus = 'CANCELLED';
  await booking.save();

  // Release the slot
  const slot = await ParkingSlot.findById(booking.slotId);
  if (slot && slot.currentBookingId?.toString() === booking._id.toString()) {
    slot.status = 'AVAILABLE';
    slot.currentBookingId = null;
    await slot.save();
  }

  return booking;
};

/**
 * Get bookings for owner's parking facilities.
 */
const getOwnerBookings = async (ownerId, query) => {
  const { page = 1, limit = 20, status, parkingId } = query;

  // Get all parking IDs owned by this owner
  const ownerParking = await Parking.find({ ownerId }).select('_id');
  const parkingIds = ownerParking.map((p) => p._id);

  const filter = { parkingId: { $in: parkingIds } };
  if (status) filter.bookingStatus = status;
  if (parkingId) filter.parkingId = parkingId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('parkingId', 'name address')
      .populate('slotId', 'slotNumber vehicleType')
      .populate('customerId', 'name email phone')
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
 * Get owner analytics.
 */
const getOwnerAnalytics = async (ownerId) => {
  const ownerParking = await Parking.find({ ownerId });
  const parkingIds = ownerParking.map((p) => p._id);

  const [slots, bookings] = await Promise.all([
    ParkingSlot.find({ parkingId: { $in: parkingIds } }),
    Booking.find({ parkingId: { $in: parkingIds } }),
  ]);

  // Today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayBookings = bookings.filter(
    (b) => b.createdAt >= todayStart && b.createdAt <= todayEnd
  );
  const completedBookings = bookings.filter(
    (b) => b.bookingStatus === 'COMPLETED'
  );
  const todayRevenue = todayBookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalSlots = slots.length;
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE').length;
  const reservedSlots = slots.filter((s) => s.status === 'RESERVED').length;
  const occupiedSlots = slots.filter((s) => s.status === 'OCCUPIED').length;

  return {
    totalParking: ownerParking.length,
    totalSlots,
    available: availableSlots,
    reserved: reservedSlots,
    occupied: occupiedSlots,
    todayBookings: todayBookings.length,
    completedBookings: completedBookings.length,
    todayRevenue,
    totalRevenue,
    occupancyPercentage:
      totalSlots > 0
        ? Math.round(((reservedSlots + occupiedSlots) / totalSlots) * 100)
        : 0,
  };
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  getOwnerAnalytics,
};
