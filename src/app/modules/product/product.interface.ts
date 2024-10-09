/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export interface IProduct {
  toObject(): any;
  _id: string;
  shop: Types.ObjectId;
  images: string[];
  name: string;
  stock: number;
  price: number;
  category: string;
  subCategory: string;
  deliveryFee: number;
  quantity: string;
  description: string;
  status: 'available' | 'unavailable';
}
