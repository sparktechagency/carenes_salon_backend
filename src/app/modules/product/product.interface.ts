import { Types } from 'mongoose';

export interface IProduct {
  shop: Types.ObjectId;
  images: string[];
  name: string;
  price: number;
  category: string;
  subCategory: string;
  deliveryFee: number;
  quantity: number;
  description: string;
  status: 'available' | 'unavailable';
}
