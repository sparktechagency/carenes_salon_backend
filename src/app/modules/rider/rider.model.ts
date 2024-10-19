import { model, Schema } from 'mongoose';
import { IRider } from './rider.interface';
const locationSchema = new Schema({
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
const riderSchema = new Schema<IRider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_image: {
      type: String,
      default: '',
    },
    phoneNumber: { type: String, required: true },
    location: {
      type: locationSchema,
      default: null,
      index: '2dsphere',
    },
    drivingLicence: { type: String, default: '' },
    bankAccountName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    paymentMethodPreference: { type: String, default: '' },
    walletAmount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Rider = model('Rider', riderSchema);

export default Rider;
