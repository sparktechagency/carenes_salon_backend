import { Types } from 'mongoose';

export interface ICategory {
  shop: Types.ObjectId;
  name: string;
  image: string;
}

export interface ISubCategory {
  shop: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  image: string;
}
