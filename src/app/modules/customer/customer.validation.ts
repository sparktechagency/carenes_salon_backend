import { z } from 'zod';

export const registerCustomerValidationSchema = z.object({
  body: z.object({
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be 6 character' }),
    // confirmPassword: z
    //   .string({ required_error: 'Confirm password is required' })
    //   .min(6, { message: 'Password must be 6 character' }),
    customer: z.object({
      firstName: z.string({
        required_error: 'First name is required',
        invalid_type_error: 'First name must be a string',
      }),
      lastName: z.string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string',
      }),
      email: z.string().email('Invalid email format').optional(),
      phoneNumber: z.string().min(1, 'Phone number is required').max(15),
      // location: z
      //   .object({
      //     type: z.literal('Point'),
      //     coordinates: z.tuple([z.number(), z.number()]),
      //   })
      //   .optional(),
      city:z.string({required_error:"City is required"}),
      country:z.string({required_error:"Country is required"}),
      gender:z.enum(["male","female"]),
      age:z.number().optional(),
      profile_image: z.string().optional(),
    }),
  }),
});
const updateCustomerProfileValidationSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    }).optional(),
    lastName: z.string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    }).optional(),
    // email: z.string().email('Invalid email format').optional(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .max(15)
      .optional(),
    // location: z
    //   .object({
    //     type: z.literal('Point'),
    //     coordinates: z.tuple([z.number(), z.number()]),
    //   })
    //   .optional(),
    city:z.string({required_error:"City is required"}).optional(),
    country:z.string({required_error:"Country is required"}).optional(),
    gender:z.enum(["male","female"]).optional(),
    age:z.number().optional(),
    profile_image: z.string().optional(),
  }),
});

const customerValidations = {
  registerCustomerValidationSchema,
  updateCustomerProfileValidationSchema,
};

export default customerValidations;
