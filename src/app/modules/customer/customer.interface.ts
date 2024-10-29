import { Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
export interface ICustomer {
  user: Types.ObjectId;
  firstName: string;
  lastName:string;
  email: string;
  phoneNumber: string;
  city:string;
  country:string;
  gender:"male"|"female";
  age:number;
  // location: ILocation;
  profile_image: string;
  isDeleted: boolean;
}
