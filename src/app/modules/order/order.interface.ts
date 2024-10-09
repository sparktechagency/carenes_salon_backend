import { Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
}
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IOrder {
  customer: Types.ObjectId;
  shop: Types.ObjectId;
  name: string;
  contactNumber: string;
  deliveryLocation: ILocation;
  items: IOrderItem[];
  totalQuantity: number;
  subTotal: number;
  totalPrice: number;
  rider: Types.ObjectId;
  deliveryFee: number;
  status: string;
}
