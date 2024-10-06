import { z } from 'zod';

export const registerCustomerValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }).min(6),
    customer: z.object({
      name: z.string().min(1, 'Name is required').max(100),
      email: z.string().email('Invalid email format'),
      phoneNumber: z.string().min(1, 'Phone number is required').max(15),
      location: z
        .object({
          type: z.literal('Point'),
          coordinates: z.tuple([z.number(), z.number()]),
        })
        .optional(),
      profile_image: z.string().optional(),
    }),
  }),
});
const updateCustomerProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    // email: z.string().email('Invalid email format').optional(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .max(15)
      .optional(),
    location: z
      .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
    profile_image: z.string().optional(),
  }),
});

const customerValidations = {
  registerCustomerValidationSchema,
  updateCustomerProfileValidationSchema,
};

export default customerValidations;
