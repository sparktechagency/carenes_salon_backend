import { model, Schema } from 'mongoose';
import { IProduct } from './product.interface';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';

const productSchema = new Schema<IProduct>(
  {
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Vendor',
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: [(val: string[]) => val.length > 0, 'Images cannot be empty'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    subCategory: {
      type: String,
      required: [true, 'Sub-category is required'],
    },
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee must be a non-negative number'],
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    stock: {
      type: Number,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: Object.values(ENUM_PRODUCT_STATUS),
      default: ENUM_PRODUCT_STATUS.AVAILABLE,
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the Product model
const Product = model<IProduct>('Product', productSchema);
export default Product;
