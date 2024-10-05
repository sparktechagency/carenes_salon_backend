import { Types } from 'mongoose';

export interface IBusiness {
  name: string;
  email: string;
  contactNumber: string;
  type: 'Restaurant' | 'GroceryShop';
  business_image: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  vendor: Types.ObjectId;
}
