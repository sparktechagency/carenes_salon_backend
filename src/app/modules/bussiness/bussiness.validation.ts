import { z } from 'zod';

export const createBusinessValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Business name is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    contactNumber: z
      .string({ required_error: 'Contact number is required' })
      .min(1, 'Contact number is required'),
    type: z.enum(['Restaurant', 'GroceryShop'], {
      errorMap: () => ({
        message: 'Type must be either Restaurant or GroceryShop',
      }),
    }),
    business_image: z.string().optional(),
    location: z
      .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
    vendor: z.string().min(1, 'Vendor is required').optional(),
  }),
});

export const updateBusinessValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Business name is required').optional(),
    email: z.string().email('Invalid email format').optional(),
    contactNumber: z.string().min(1, 'Contact number is required').optional(),
    type: z
      .enum(['Restaurant', 'GroceryShop'], {
        errorMap: () => ({
          message: 'Type must be either Restaurant or GroceryShop',
        }),
      })
      .optional(),
    business_image: z.string().optional(),
    location: z
      .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
  }),
});

const businessValidationSchema = {
  createBusinessValidationSchema,
  updateBusinessValidationSchema,
};

export default businessValidationSchema;
