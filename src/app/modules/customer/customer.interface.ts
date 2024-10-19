import { Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
export interface ICustomer {
  user: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  location: ILocation;
  profile_image: string;
  walletAmount: number;
  isDeleted: boolean;
}
