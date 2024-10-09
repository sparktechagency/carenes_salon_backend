import { model, Schema } from 'mongoose';
import { ILocation, IOrder } from './order.interface';
import { ENUM_ORDER_STATUS } from '../../utilities/enum';
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
    shop: {
      type: Schema.Types.ObjectId,

      required: true,
      ref: 'Vendor',
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
    rider: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: 'Rider',
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ENUM_ORDER_STATUS),
      default: ENUM_ORDER_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

const Order = model<IOrder>('Order', OrderSchema);

export default Order;
