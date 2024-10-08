import { model, Schema } from 'mongoose';
import { ILocation, IOrder } from './order.interface';
const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});
const OrderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    name: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    deliveryLocation: {
      type: LocationSchema,
      default: null,
      index: '2dsphere',
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Order = model<IOrder>('Order', OrderSchema);

export default Order;
