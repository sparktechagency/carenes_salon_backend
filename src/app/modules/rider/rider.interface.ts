import { Types } from 'mongoose';
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
export interface IRider {
  user: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  location: ILocation;
  profile_image: string;
  drivingLicence: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  paymentMethodPreference: string;
  walletAmount: number;
  isDeleted: boolean;
}
