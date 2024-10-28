import { Types } from 'mongoose';
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
// client interface
export interface IClient {
  user: Types.ObjectId;
  name: string;
  email: string;
  shopCategory: string;
  shopGenderCategory: 'male' | 'female';
  shopImages: [string];
  phoneNumber: string;
  location: ILocation;
  profile_image: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  branchCode: string;
  bankCity: string;
  isDeleted: boolean;
}
