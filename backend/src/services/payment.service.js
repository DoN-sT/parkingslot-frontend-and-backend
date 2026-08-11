const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const generateQRToken = require('../utils/generateQR');

// Initialize Razorpay (lazy — only when keys are available)
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw ApiError.internal(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      );
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order for a booking.
 */
const createPayment = async (bookingDbId, customerId) => {
  const booking = await Booking.findById(bookingDbId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Enforce ownership
  if (booking.customerId.toString() !== customerId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  // Can only pay for PENDING bookings
  if (booking.bookingStatus !== 'PENDING') {
    throw ApiError.badRequest(
      `Cannot create payment for booking with status ${booking.bookingStatus}`
    );
  }
  if (booking.paymentStatus === 'PAID') {
    throw ApiError.badRequest('Payment has already been made for this booking');
  }

  // Create Razorpay order
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(booking.amount * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: {
      bookingId: booking._id.toString(),
      customerId,
    },
  });

  // Create payment record
  const payment = await Payment.create({
    bookingId: booking._id,
    customerId,
    amount: booking.amount,
    gateway: 'RAZORPAY',
    orderId: order.id,
    status: 'PENDING',
  });

  return {
    payment,
    razorpayOrder: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // Safe to expose — this is the public key
    },
  };
};

/**
 * Verify Razorpay payment.
 * ONLY backend marks payment as PAID — never trust frontend.
 */
const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  // Find the payment by orderId
  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
    throw ApiError.notFound('Payment record not found');
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    // Mark payment as failed
    payment.status = 'FAILED';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'FAILED';
      await booking.save();
    }

    throw ApiError.badRequest('Payment verification failed — invalid signature');
  }

  // Mark payment as PAID
  payment.transactionId = razorpay_payment_id;
  payment.status = 'PAID';
  await payment.save();

  // Update booking: PAID + CONFIRMED + generate QR token
  const booking = await Booking.findById(payment.bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found for this payment');
  }

  booking.paymentStatus = 'PAID';
  booking.bookingStatus = 'CONFIRMED';
  booking.qrToken = generateQRToken();
  await booking.save();

  return {
    payment,
    booking,
  };
};

/**
 * Get payment details.
 */
const getPaymentById = async (paymentId, userId, role) => {
  const payment = await Payment.findById(paymentId)
    .populate('bookingId', 'bookingId bookingStatus amount')
    .populate('customerId', 'name email');

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  // Enforce ownership for customers
  if (role === 'CUSTOMER' && payment.customerId._id.toString() !== userId) {
    throw ApiError.forbidden('You do not have access to this payment');
  }

  return payment;
};

module.exports = { createPayment, verifyPayment, getPaymentById };
