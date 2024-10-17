import { model, Schema } from 'mongoose';
import { IVendor } from './vendor.interface';
import { ENUM_SHOP_TYPE } from '../../utilities/enum';

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

const vendorSchema = new Schema<IVendor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    storeName: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    storeLocation: {
      type: locationSchema,
      default: null,
      index: '2dsphere',
    },
    email: { type: String, required: true, unique: true },
    storeImage: { type: String, default: '' },
    storeLicence: { type: String, default: '' },
    shopType: {
      type: String,
      enum: Object.values(ENUM_SHOP_TYPE),
      required: true,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    totalRatingCount: {
      type: Number,
      default: 0,
    },
    bankAccountName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    paymentMethodPreference: { type: String, default: '' },
    status: {
      type: String,
      enum: ['activate', 'deactivate'],
      default: 'deactivate',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Vendor = model<IVendor>('Vendor', vendorSchema);

export default Vendor;
