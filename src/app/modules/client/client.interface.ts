import { Types } from 'mongoose';
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
// client interface
export interface IClient {
  user: Types.ObjectId;
  firstName: string;
  lastName:string;
  email: string;
  phoneNumber: string;
  gender:"male"|"female";
  dateOfBirth:Date;
  shopName:string;
  shopCategory: string;
  shopGenderCategory: 'male' | 'female';
  shopImages: [string];
  location: ILocation;
  profile_image: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  branchCode: string;
  bankCity: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
