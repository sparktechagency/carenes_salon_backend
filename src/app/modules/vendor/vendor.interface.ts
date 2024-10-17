import { Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IVendor {
  _id: string;
  user: Types.ObjectId;
  storeName: string;
  phoneNumber: string;
  storeLocation: ILocation;
  email: string;
  storeImage: string;
  storeLicence: string;
  shopType: 'Restaurant' | 'Grocery';
  totalRating: number;
  totalRatingCount: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  paymentMethodPreference: string;
  status: 'active' | 'deactivate';
  isDeleted: boolean;
}
