const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const parkingRoutes = require('./parking.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const ownerRoutes = require('./owner.routes');
const employeeRoutes = require('./employee.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/parking', parkingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/owner', ownerRoutes);
router.use('/employee', employeeRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
