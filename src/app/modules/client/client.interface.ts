import { Types } from 'mongoose';
import { ENUM_PAYMENT_PREFERENCES } from '../../utilities/enum';
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
// client interface
export interface IClient {
  user: Types.ObjectId;
  shopCategoryId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  shopName: string;
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
  paymentPreferences: (typeof ENUM_PAYMENT_PREFERENCES)[keyof typeof ENUM_PAYMENT_PREFERENCES];
  payOnShopChargeDueAmount : number;
  status: 'active' | 'inactive';
  totalRating: number;
  totalRatingCount: number;
  isDeleted: boolean;
  isShopInfoProvided: boolean;
  isProfileCompleted: boolean;
  stripAccountId:string;
  isStripeConnected: boolean;
}
