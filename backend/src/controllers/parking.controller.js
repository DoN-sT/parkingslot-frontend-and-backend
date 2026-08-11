const parkingService = require('../services/parking.service');
const ApiResponse = require('../utils/ApiResponse');

// ======================== PUBLIC ========================

const listParking = async (req, res, next) => {
  try {
    const result = await parkingService.listParking(req.query);
    return ApiResponse.ok(res, 'Parking facilities retrieved', result);
  } catch (error) {
    next(error);
  }
};

const getParkingById = async (req, res, next) => {
  try {
    const parking = await parkingService.getParkingById(req.params.id);
    return ApiResponse.ok(res, 'Parking facility retrieved', parking);
  } catch (error) {
    next(error);
  }
};

const getSlotAvailability = async (req, res, next) => {
  try {
    const result = await parkingService.getSlotAvailability(
      req.params.parkingId,
      req.query
    );
    return ApiResponse.ok(res, 'Slot availability retrieved', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { listParking, getParkingById, getSlotAvailability };
