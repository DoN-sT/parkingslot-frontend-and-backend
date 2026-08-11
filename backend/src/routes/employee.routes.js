const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const {
  authMiddleware,
  roleMiddleware,
  permissionMiddleware,
} = require('../middleware/auth');

// All employee routes require EMPLOYEE role
router.use(authMiddleware);
router.use(roleMiddleware('EMPLOYEE'));

// POST /api/employee/scan — Scan QR token
router.post(
  ['/scan', '/scan-qr'],
  permissionMiddleware('scanQR'),
  employeeController.scanQR
);

// POST /api/employee/entry — Verify entry
router.post(
  ['/entry', '/confirm-entry'],
  permissionMiddleware('verifyEntry'),
  employeeController.verifyEntry
);

// POST /api/employee/exit — Verify exit
router.post(
  ['/exit', '/confirm-exit'],
  permissionMiddleware('verifyExit'),
  employeeController.verifyExit
);

// GET /api/employee/bookings — View assigned parking's bookings
router.get(
  '/bookings',
  permissionMiddleware('viewBookings'),
  employeeController.getBookings
);

// GET /api/employee/activity — View entry/exit activity
router.get(['/activity', '/logs'], employeeController.getActivity);

// GET /api/employee/active-vehicles — Get currently parked vehicles
router.get('/active-vehicles', employeeController.getActiveVehicles);

module.exports = router;
