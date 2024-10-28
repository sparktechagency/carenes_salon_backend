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
  shopName: string;
  name: string;
  contactNumber: string;
  shopLocation: ILocation;
  deliveryLocation: ILocation;
  items: IOrderItem[];
  totalQuantity: number;
  subTotal: number;
  totalPrice: number;
  Client: Types.ObjectId;
  deliveryFee: number;
  status: string;
  // for payment
  paymentId: string;
  paymentStatus: string;
}
