const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    gateway: {
      type: String,
      enum: {
        values: ['RAZORPAY', 'STRIPE'],
        message: '{VALUE} is not a valid payment gateway',
      },
      default: 'RAZORPAY',
    },
    orderId: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ status: 1 });
paymentSchema.index({ orderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
