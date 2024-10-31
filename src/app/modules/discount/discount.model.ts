/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema, Types } from 'mongoose';
import { IDiscount } from './discount.interface';

const DiscountSchema: Schema = new Schema<IDiscount>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    services: {
      type: Schema.Types.Mixed,
      required: true,
      validator: function (value: any) {
        return (
          (typeof value === 'string' && value === 'all-services') ||
          (Array.isArray(value) &&
            value.every((id) => Types.ObjectId.isValid(id)))
        );
      },
    },
    products: {
      type: Schema.Types.Mixed,
      required: true,
      validator: function (value: any) {
        return (
          (typeof value === 'string' && value === 'all-services') ||
          (Array.isArray(value) &&
            value.every((id) => Types.ObjectId.isValid(id)))
        );
      },
    },
    discountStartDate: {
      type: Date,
      required: true,
    },
    discountEndDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IDiscount, value: Date) {
          return value > this.discountStartDate;
        },
        message: 'End date must be after start date',
      },
    },
  },
  {
    timestamps: true,
  },
);

const Discount = model<IDiscount>('Discount', DiscountSchema);

export default Discount;
