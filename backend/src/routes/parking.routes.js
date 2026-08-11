const express = require('express');
const router = express.Router();
const {
  listParking,
  getParkingById,
  getSlotAvailability,
} = require('../controllers/parking.controller');

// GET /api/parking — List all active parking (public)
router.get('/', listParking);

// GET /api/parking/:id — Parking detail (public)
router.get('/:id', getParkingById);

// GET /api/parking/:parkingId/slots — Slot availability (public)
router.get('/:parkingId/slots', getSlotAvailability);

module.exports = router;
