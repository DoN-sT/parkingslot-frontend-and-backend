const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Parking name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    totalSlots: {
      type: Number,
      required: [true, 'Total slots is required'],
      min: [1, 'Must have at least 1 slot'],
    },
    pricing: {
      twoWheeler: {
        type: Number,
        default: 0,
        min: 0,
      },
      fourWheeler: {
        type: Number,
        default: 0,
        min: 0,
      },
      heavy: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    facilities: {
      type: [String],
      default: [],
    },
    openingTime: {
      type: String,
      required: [true, 'Opening time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Opening time must be in HH:MM format'],
    },
    closingTime: {
      type: String,
      required: [true, 'Closing time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Closing time must be in HH:MM format'],
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'PENDING'],
        message: '{VALUE} is not a valid status',
      },
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
parkingSchema.index({ status: 1 });
parkingSchema.index({ 'location.lat': 1, 'location.lng': 1 });
parkingSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Parking', parkingSchema);
