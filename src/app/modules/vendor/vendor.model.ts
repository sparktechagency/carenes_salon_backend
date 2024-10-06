import { model, Schema } from 'mongoose';
import { IVendor } from './vendor.interface';

const vendorSchema = new Schema<IVendor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    storeName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    storeLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    email: { type: String, required: true, unique: true },
    storeImage: { type: String, required: true },
    storeLicence: { type: String, required: true },
    shopType: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    paymentMethodPreference: { type: String, required: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Vendor = model<IVendor>('Vendor', vendorSchema);

export default Vendor;
