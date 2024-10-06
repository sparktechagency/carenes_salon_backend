import { model, Schema } from 'mongoose';
import { ICategory, ISubCategory } from './category.interface';

const CategorySchema: Schema = new Schema<ICategory>({
  shop: { type: Schema.Types.ObjectId, required: true, ref: 'Vendor' },
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
});

const subCategorySchema: Schema = new Schema<ISubCategory>({
  shop: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Category = model<ICategory>('Category', CategorySchema);
export const SubCategory = model<ISubCategory>(
  'SubCategory',
  subCategorySchema,
);
export default Category;
