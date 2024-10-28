import { Types } from 'mongoose';
import { z } from 'zod';
const locationSchema = z
  .object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  })
  .optional();
const registerClientValidationSchema = z.object({
  body: z.object({
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be 6 character' }),
    // confirmPassword: z
    //   .string({ required_error: 'Confirm password is required' })
    //   .min(6, { message: 'Password must be 6 character' }),
    client: z.object({
      user: z.instanceof(Types.ObjectId),
      name: z
        .string({
          required_error: 'Name is required',
          invalid_type_error: 'Name must be a string',
        })
        .nonempty(),
      email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'Please provide a valid email' }),
      shopCategory: z
        .string({ required_error: 'Shop category is required' })
        .nonempty(),
      shopGenderCategory: z.enum(['male', 'female']),
      shopImages: z.array(z.string()).optional(),
      phoneNumber: z
        .string({ required_error: 'Phone number is required' })
        .nonempty(),
      location: locationSchema,
      profile_image: z.string().nonempty(),
      bankName: z
        .string({ required_error: 'Bank name is required' })
        .nonempty(),
      bankAccountName: z
        .string({ required_error: 'Bank account name is required' })
        .nonempty(),
      bankAccountNumber: z
        .string({ required_error: 'Bank account number is required' })
        .nonempty(),
      branchCode: z
        .string({ required_error: 'Branch code is required' })
        .nonempty(),
      bankCity: z
        .string({ required_error: 'Bank city is required' })
        .nonempty(),
    }),
  }),
});
const updateClientProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .nonempty()
      .optional(),
    // email: z
    //   .string({ required_error: 'Email is required' })
    //   .email({ message: 'Please provide a valid email' }).optional(),
    shopCategory: z
      .string({ required_error: 'Shop category is required' })
      .nonempty()
      .optional(),
    shopGenderCategory: z.enum(['male', 'female']).optional(),
    shopImages: z.array(z.string()).optional(),
    phoneNumber: z
      .string({ required_error: 'Phone number is required' })
      .nonempty()
      .optional(),
    location: locationSchema,
    profile_image: z.string().nonempty().optional(),
    bankName: z
      .string({ required_error: 'Bank name is required' })
      .nonempty()
      .optional(),
    bankAccountName: z
      .string({ required_error: 'Bank account name is required' })
      .nonempty()
      .optional(),
    bankAccountNumber: z
      .string({ required_error: 'Bank account number is required' })
      .nonempty()
      .optional(),
    branchCode: z
      .string({ required_error: 'Branch code is required' })
      .nonempty()
      .optional(),
    bankCity: z
      .string({ required_error: 'Bank city is required' })
      .nonempty()
      .optional(),
  }),
});
const ClientValidations = {
  registerClientValidationSchema,
  updateClientProfileValidationSchema,
};

export default ClientValidations;
