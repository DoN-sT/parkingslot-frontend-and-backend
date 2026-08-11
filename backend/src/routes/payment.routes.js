const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  getPaymentById,
} = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth');

// All payment routes require authentication
router.use(authMiddleware);

// POST /api/payments/create — Initiate payment
router.post('/create', createPayment);

// POST /api/payments/verify — Verify payment (Razorpay callback)
router.post('/verify', verifyPayment);

// GET /api/payments/:id — Payment detail
router.get('/:id', getPaymentById);

module.exports = router;
