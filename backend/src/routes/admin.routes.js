const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// All admin routes require ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// GET /api/admin/dashboard — Platform overview
router.get('/dashboard', adminController.getDashboard);

// GET /api/admin/users — All users
router.get('/users', adminController.getUsers);

// GET /api/admin/owners — All owners
router.get('/owners', adminController.getOwners);

// PATCH /api/admin/owners/:id/approve — Approve owner
router.patch('/owners/:id/approve', adminController.approveOwner);

// PATCH /api/admin/owners/:id/reject — Reject owner
router.patch('/owners/:id/reject', adminController.rejectOwner);

// PATCH /api/admin/users/:id/status — Change user status
router.patch('/users/:id/status', adminController.updateUserStatus);

// GET /api/admin/parking — All parking
router.get('/parking', adminController.getAllParking);

// GET /api/admin/parking/pending — Pending parking listings
router.get('/parking/pending', adminController.getPendingParking);

// PATCH /api/admin/parking/:id/approve — Approve parking listing
router.patch('/parking/:id/approve', adminController.approveParking);

// PATCH /api/admin/parking/:id/reject — Reject parking listing
router.patch('/parking/:id/reject', adminController.rejectParking);

// GET /api/admin/bookings — All bookings
router.get('/bookings', adminController.getAllBookings);

// GET /api/admin/payments — All payments
router.get('/payments', adminController.getAllPayments);

// GET /api/admin/analytics — Platform analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
