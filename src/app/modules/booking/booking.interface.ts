import { Types } from "mongoose";

interface IServices {
  serviceId:Types.ObjectId;
  price:number;
}
interface IProducts {
  productId:Types.ObjectId;
  price:number;
}

export interface IBooking {
    customerId: Types.ObjectId; 
    shopId: Types.ObjectId; 
    staffId: Types.ObjectId; 
    // serviceIds: string[]; 
    services:IServices[];
    products:IProducts;
    startTime: Date;
    endTime: Date;
    status: 'booked' | 'completed' | 'canceled';
  }