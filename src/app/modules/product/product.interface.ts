import { Types } from "mongoose";

export interface IProduct {
  shop:Types.ObjectId;
  name: string;
  price: number;
  description: string;
  piecesSold: number;
  product_image: string;
}
