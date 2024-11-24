import { Types } from "mongoose";
import { ENUM_BOOKING_PAYMENT, ENUM_PAYMENT_STATUS } from "../../utilities/enum";

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
    totalPrice: number;
    totalDuration: number;
    bookingPaymentType:(typeof ENUM_BOOKING_PAYMENT)[keyof typeof ENUM_BOOKING_PAYMENT];
    paymentStatus:(typeof ENUM_PAYMENT_STATUS)[keyof typeof ENUM_PAYMENT_STATUS];
    shopCategoryId: Types.ObjectId;
    paymentIntentId:string;
    note:string;
  }

