import { z } from 'zod';
import { ENUM_BOOKING_PAYMENT, ENUM_PAYMENT_STATUS } from '../../utilities/enum';

// Schema for individual services
const serviceSchema = z.object({
  serviceId: z.string().nonempty("Service ID is required"), 
  price: z.number().positive("Price must be a positive number"),
});

// Main Booking Schema
const bookingValidationSchema = z.object({
  customerId: z.string().nonempty("Customer ID is required"),
  shopId: z.string().nonempty("Shop ID is required"), 
  staffId: z.string().nonempty("Staff ID is required"),
  services: z.array(serviceSchema).nonempty("Services array cannot be empty"), 
  endTime:z.string({required_error:"End time is required"}),
  status: z.enum(['booked', 'completed', 'canceled'], {
    required_error: "Status is required",
  }),
  totalPrice: z.number().positive("Total price must be a positive number"),
  bookingPaymentType: z.enum(
    Object.values(ENUM_BOOKING_PAYMENT) as [string, ...string[]],
  ),
  paymentStatus: z.enum(
    Object.values(ENUM_PAYMENT_STATUS) as [string, ...string[]],
  ),
});

export const changeCancelRequestStatusValidationsSchema = z.object({
  body: z.object({
    status: z.enum(['accept', 'reject'], {
      required_error: "Status is required",
    }),
  }),
})

export default bookingValidationSchema;
