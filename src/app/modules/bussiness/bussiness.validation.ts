import { z } from 'zod';

export const createBusinessValidationSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email format'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  type: z.enum(['Restaurant', 'GroceryShop'], {
    errorMap: () => ({
      message: 'Type must be either Restaurant or GroceryShop',
    }),
  }),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  vendor: z.string().min(1, 'Vendor is required'),
});

const businessValidationSchema = {
  createBusinessValidationSchema,
};

export default businessValidationSchema;
