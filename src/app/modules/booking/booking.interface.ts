import { Types } from "mongoose";

export interface IBooking {
    customerId: Types.ObjectId; 
    shopId: Types.ObjectId; 
    staffId: Types.ObjectId; 
    serviceIds: string[]; 
    startTime: Date;
    endTime: Date;
    status: 'booked' | 'completed' | 'canceled';
  }