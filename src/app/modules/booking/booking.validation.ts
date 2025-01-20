import { z } from 'zod';
import {
  ENUM_BOOKING_PAYMENT,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';

// Schema for individual services
const serviceSchema = z.object({
  serviceId: z.string().nonempty('Service ID is required'),
  price: z.number().positive('Price must be a positive number'),
});

// Main Booking Schema
const bookingValidationSchema = z.object({
  customerId: z.string().nonempty('Customer ID is required'),
  shopId: z.string().nonempty('Shop ID is required'),
  staffId: z.string().nonempty('Staff ID is required'),
  services: z.array(serviceSchema).nonempty('Services array cannot be empty'),
  date: z.string({ required_error: 'Date is required' }),
  startTime: z.string({ required_error: 'Start time is required' }),
  totalPrice: z.number().positive('Total price must be a positive number'),
  bookingPaymentType: z.enum(
    Object.values(ENUM_BOOKING_PAYMENT) as [string, ...string[]],
  ),
  paymentStatus: z.enum(
    Object.values(ENUM_PAYMENT_STATUS) as [string, ...string[]],
  ),
  paymentMethod: z.enum(
    Object.values(ENUM_PAYMENT_METHOD) as [string, ...string[]],
  ),
});

export const changeCancelRequestStatusValidationsSchema = z.object({
  body: z.object({
    status: z.enum(['accept', 'reject'], {
      required_error: 'Status is required',
    }),
  }),
});

export default bookingValidationSchema;
