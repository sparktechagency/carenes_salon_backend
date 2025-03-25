import { model, Schema } from 'mongoose';
import { IBooking } from './booking.interface';
import {
  ENUM_BOOKING_PAYMENT,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';

const servicesSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Service',
  },
  price: {
    type: Number,
    required: true,
  },
});

const BookingSchema = new Schema<IBooking>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      // required: true,
      default: null,
    },
    shopId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    // serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }],
    services: [servicesSchema],
    // products:[productsSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['booked', 'completed', 'canceled'],
      default: 'booked',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalDuration: {
      type: Number,
      required: true,
    },
    bookingPaymentType: {
      type: String,
      enum: Object.values(ENUM_BOOKING_PAYMENT),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_STATUS),
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_METHOD),
      required: true,
    },
    shopCategoryId: { type: Schema.Types.ObjectId, required: true },
    note: {
      type: String,
    },
    paymentIntentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    captureId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Booking = model('Booking', BookingSchema);

export default Booking;
