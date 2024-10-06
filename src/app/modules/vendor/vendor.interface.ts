import { Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IVendor {
  user: Types.ObjectId;
  storeName: string;
  phoneNumber: string;
  storeLocation: ILocation;
  email: string;
  storeImage: string;
  storeLicence: string;
  shopType: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  paymentMethodPreference: string;
  isDeleted: boolean;
}
