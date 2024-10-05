import { model, Schema } from 'mongoose';
import { ICustomer, ILocation } from './customer.interface';

const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    location: {
      type: LocationSchema,
      required: true,
      index: '2dsphere',
    },
    profile_image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Customer = model<ICustomer>('Customer', CustomerSchema);

export default Customer;
