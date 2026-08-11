const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: [true, 'Parking ID is required'],
      index: true,
    },
    employeeId: {
      type: String,
      unique: true,
      default: () => `EMP-${uuidv4().slice(0, 8).toUpperCase()}`,
      index: true,
    },
    permissions: {
      scanQR: { type: Boolean, default: false },
      verifyEntry: { type: Boolean, default: false },
      verifyExit: { type: Boolean, default: false },
      viewBookings: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
        message: '{VALUE} is not a valid status',
      },
      default: 'PENDING',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({ ownerId: 1, parkingId: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
