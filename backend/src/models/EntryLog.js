const mongoose = require('mongoose');

const entryLogSchema = new mongoose.Schema(
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
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: [true, 'Parking ID is required'],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: ['ENTRY', 'EXIT'],
        message: '{VALUE} is not a valid action',
      },
      required: [true, 'Action is required'],
    },
    result: {
      type: String,
      enum: {
        values: ['APPROVED', 'REJECTED'],
        message: '{VALUE} is not a valid result',
      },
      required: [true, 'Result is required'],
    },
    reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

entryLogSchema.index({ employeeId: 1 });
entryLogSchema.index({ parkingId: 1, createdAt: -1 });

module.exports = mongoose.model('EntryLog', entryLogSchema);
