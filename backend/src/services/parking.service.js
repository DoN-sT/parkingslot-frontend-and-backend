const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const ApiError = require('../utils/ApiError');

// ======================== PUBLIC ========================

/**
 * List all active parking facilities with optional filters.
 */
const listParking = async (query) => {
  const { search, lat, lng, radius, page = 1, limit = 20 } = query;

  const filter = { status: 'ACTIVE' };

  // Text search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
    ];
  }

  // Simple location-based filtering (bounding box approximation)
  if (lat && lng && radius) {
    const radiusKm = parseFloat(radius);
    const latDelta = radiusKm / 111; // ~111 km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos((parseFloat(lat) * Math.PI) / 180));
    filter['location.lat'] = {
      $gte: parseFloat(lat) - latDelta,
      $lte: parseFloat(lat) + latDelta,
    };
    filter['location.lng'] = {
      $gte: parseFloat(lng) - lngDelta,
      $lte: parseFloat(lng) + lngDelta,
    };
  }

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
 * Get parking detail by ID.
 */
const getParkingById = async (parkingId) => {
  const parking = await Parking.findById(parkingId).populate(
    'ownerId',
    'name email phone'
  );
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  return parking;
};

/**
 * Get slot availability for a parking facility.
 * Backend is the source of truth — always checks DB.
 */
const getSlotAvailability = async (parkingId, query) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }

  const filter = { parkingId };
  if (query.vehicleType) {
    filter.vehicleType = query.vehicleType;
  }

  const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 });

  const summary = {
    total: slots.length,
    available: slots.filter((s) => s.status === 'AVAILABLE').length,
    reserved: slots.filter((s) => s.status === 'RESERVED').length,
    occupied: slots.filter((s) => s.status === 'OCCUPIED').length,
    maintenance: slots.filter((s) => s.status === 'MAINTENANCE').length,
  };

  return { slots, summary };
};

// ======================== OWNER ========================

/**
 * Create a new parking facility (ownerId from JWT).
 */
const createParking = async (ownerId, data) => {
  const parking = await Parking.create({ ...data, ownerId, status: 'PENDING' });
  return parking;
};

/**
 * Update a parking facility (ownership enforced).
 */
const updateParking = async (parkingId, ownerId, data) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  // Prevent changing ownerId
  delete data.ownerId;

  Object.assign(parking, data);
  await parking.save();
  return parking;
};

/**
 * Delete a parking facility (ownership enforced).
 */
const deleteParking = async (parkingId, ownerId) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  // Delete associated slots
  await ParkingSlot.deleteMany({ parkingId: parking._id });
  await parking.deleteOne();

  return { message: 'Parking facility and associated slots deleted' };
};

/**
 * Add a slot to a parking facility.
 */
const addSlot = async (parkingId, ownerId, data) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  // Check for duplicate slot number
  const existingSlot = await ParkingSlot.findOne({
    parkingId,
    slotNumber: data.slotNumber,
  });
  if (existingSlot) {
    throw ApiError.conflict(
      `Slot number '${data.slotNumber}' already exists in this parking facility`
    );
  }

  const slot = await ParkingSlot.create({ ...data, parkingId });
  return slot;
};

/**
 * Add multiple slots to a parking facility (bulk create).
 */
const addBulkSlots = async (parkingId, ownerId, slotsData) => {
  const parking = await Parking.findById(parkingId);
  if (!parking) {
    throw ApiError.notFound('Parking facility not found');
  }
  if (parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  const slots = slotsData.map((s) => ({ ...s, parkingId }));
  const createdSlots = await ParkingSlot.insertMany(slots, { ordered: false });
  return createdSlots;
};

/**
 * Update a slot (ownership enforced via parking).
 */
const updateSlot = async (slotId, ownerId, data) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) {
    throw ApiError.notFound('Slot not found');
  }

  const parking = await Parking.findById(slot.parkingId);
  if (!parking || parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  // Don't allow changing parkingId
  delete data.parkingId;

  Object.assign(slot, data);
  await slot.save();
  return slot;
};

/**
 * Delete a slot (ownership enforced via parking).
 */
const deleteSlot = async (slotId, ownerId) => {
  const slot = await ParkingSlot.findById(slotId);
  if (!slot) {
    throw ApiError.notFound('Slot not found');
  }

  const parking = await Parking.findById(slot.parkingId);
  if (!parking || parking.ownerId.toString() !== ownerId) {
    throw ApiError.forbidden('You do not own this parking facility');
  }

  if (slot.status === 'RESERVED' || slot.status === 'OCCUPIED') {
    throw ApiError.badRequest(
      'Cannot delete a slot that is currently reserved or occupied'
    );
  }

  await slot.deleteOne();
  return { message: 'Slot deleted successfully' };
};

/**
 * Get all parking facilities owned by a specific owner.
 */
const getOwnerParking = async (ownerId) => {
  const parking = await Parking.find({ ownerId }).sort({ createdAt: -1 });
  return parking;
};

module.exports = {
  listParking,
  getParkingById,
  getSlotAvailability,
  createParking,
  updateParking,
  deleteParking,
  addSlot,
  addBulkSlots,
  updateSlot,
  deleteSlot,
  getOwnerParking,
};
