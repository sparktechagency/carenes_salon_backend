import { Types } from 'mongoose';

export interface IStaff {
  shop:Types.ObjectId;
  name: string;
  specialty: string;
  phoneNumber: string;
  email: string;
  employmentStartDate: Date;
  services: 'all-services' | Types.ObjectId[];
  profile_image?: string;
  totalRating:number;
  totalRatingCount:number;
}
