const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parking',
      required: [true, 'Parking ID is required'],
      index: true,
    },
    slotNumber: {
      type: String,
      required: [true, 'Slot number is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY'],
        message: '{VALUE} is not a valid vehicle type',
      },
      required: [true, 'Vehicle type is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'],
        message: '{VALUE} is not a valid status',
      },
      default: 'AVAILABLE',
    },
    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique slot number within a parking facility
parkingSlotSchema.index({ parkingId: 1, slotNumber: 1 }, { unique: true });
parkingSlotSchema.index({ parkingId: 1, status: 1 });
parkingSlotSchema.index({ parkingId: 1, vehicleType: 1, status: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
