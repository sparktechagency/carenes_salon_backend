import mongoose, { Schema, model } from 'mongoose';
import { IBusiness } from './bussiness.interface';

// Create a schema for Business
const businessSchema: Schema<IBusiness> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Restaurant', 'GroceryShop'],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

// Create geospatial index for the location
businessSchema.index({ location: '2dsphere' });

const Business = model<IBusiness>('Business', businessSchema);

export default Business;
