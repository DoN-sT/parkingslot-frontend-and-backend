const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  createParkingValidator,
  updateParkingValidator,
  createSlotValidator,
  updateSlotValidator,
} = require('../validators/parking.validator');
const {
  createEmployeeValidator,
  updatePermissionsValidator,
  updateStatusValidator,
} = require('../validators/employee.validator');
const validate = require('../middleware/validate');

// All owner routes require OWNER role
router.use(authMiddleware);
router.use(roleMiddleware('OWNER'));

// ======================== PARKING MANAGEMENT ========================

// GET /api/owner/parking — Get own parking facilities
router.get('/parking', ownerController.getMyParking);

// POST /api/owner/parking — Create parking
router.post(
  '/parking',
  createParkingValidator,
  validate,
  ownerController.createParking
);

// PUT /api/owner/parking/:id — Update parking
router.put(
  '/parking/:id',
  updateParkingValidator,
  validate,
  ownerController.updateParking
);

// DELETE /api/owner/parking/:id — Delete parking
router.delete('/parking/:id', ownerController.deleteParking);

// ======================== SLOT MANAGEMENT ========================

// POST /api/owner/parking/:parkingId/slots — Add slot(s)
router.post(
  '/parking/:parkingId/slots',
  createSlotValidator,
  validate,
  ownerController.addSlots
);

// PUT /api/owner/slots/:id — Update slot
router.put(
  '/slots/:id',
  updateSlotValidator,
  validate,
  ownerController.updateSlot
);

// DELETE /api/owner/slots/:id — Delete slot
router.delete('/slots/:id', ownerController.deleteSlot);

// ======================== BOOKINGS & ANALYTICS ========================

// GET /api/owner/bookings — View bookings for own facilities
router.get('/bookings', ownerController.getOwnerBookings);

// GET /api/owner/analytics — Owner analytics
router.get('/analytics', ownerController.getOwnerAnalytics);

// ======================== EMPLOYEE MANAGEMENT ========================

// POST /api/owner/employees — Create Employee
router.post(
  '/employees',
  createEmployeeValidator,
  validate,
  ownerController.createEmployee
);

// GET /api/owner/employees — List own Employees
router.get('/employees', ownerController.getEmployees);

// GET /api/owner/employees/:id — Employee detail
router.get('/employees/:id', ownerController.getEmployeeById);

// PATCH /api/owner/employees/:id/verify — Verify Employee
router.patch('/employees/:id/verify', ownerController.verifyEmployee);

// PATCH /api/owner/employees/:id/status — Change Employee status
router.patch(
  '/employees/:id/status',
  updateStatusValidator,
  validate,
  ownerController.updateEmployeeStatus
);

// PATCH /api/owner/employees/:id/permissions — Assign permissions
router.patch(
  '/employees/:id/permissions',
  updatePermissionsValidator,
  validate,
  ownerController.updateEmployeePermissions
);

module.exports = router;
