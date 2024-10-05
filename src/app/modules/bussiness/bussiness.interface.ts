import { Types } from 'mongoose';

export interface IBusiness {
  name: string;
  email: string;
  contactNumber: string;
  type: 'Restaurant' | 'GroceryShop';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  vendor: Types.ObjectId;
}
