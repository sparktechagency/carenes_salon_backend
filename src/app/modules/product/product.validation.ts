import { z } from 'zod';

const createProductValidationSchema = z.object({
  body: z.object({
    images: z
      .array(z.string())
      .nonempty({ message: 'At least one image is required' }),
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    price: z
      .number({ required_error: 'Price is required' })
      .positive('Price must be a positive number'),
    category: z
      .string({ required_error: 'Category is required' })
      .min(1, 'Category is required'),
    subCategory: z
      .string({ required_error: 'Sub category is required' })
      .min(1, 'Sub-category is required'),
    deliveryFee: z
      .number({ required_error: 'Delivery fee is required' })
      .nonnegative('Delivery fee must be a non-negative number'),
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .min(1, 'Quantity must be at least 1'),
    description: z
      .string({ required_error: 'Description is required' })
      .min(1, 'Description is required'),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    images: z
      .array(z.string())
      .nonempty({ message: 'At least one image is required' })
      .optional(),
    name: z.string().min(1, 'Name is required').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    subCategory: z.string().min(1, 'Sub-category is required').optional(),
    deliveryFee: z
      .number()
      .nonnegative('Delivery fee must be a non-negative number')
      .optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
    description: z.string().min(1, 'Description is required').optional(),
  }),
});

const productValidations = {
  createProductValidationSchema,
  updateProductValidationSchema,
};

export default productValidations;
