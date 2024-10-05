import { z } from 'zod';

const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

const registerVendorValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }).min(6),
    vendor: z.object({
      storeName: z
        .string({ required_error: 'Store is required' })
        .min(1, 'Store name is required'),
      phoneNumber: z
        .string({ required_error: 'Phone number is required' })
        .min(1, 'Phone number is required'),
      storeLocation: locationSchema,
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .min(1, 'Email is required'),

      storeImage: z.string().min(1, 'Store image is required').optional(),
      storeLicence: z.string().min(1, 'Store licence is required').optional(),
      shopType: z
        .string({ required_error: 'Shop type is required' })
        .min(1, 'Shop type is required'),
      bankAccountName: z
        .string({ required_error: 'Bank account name is required' })
        .min(1, 'Bank account name is required'),
      bankAccountNumber: z
        .string({ required_error: 'Bank account number is required' })
        .min(1, 'Bank account number is required'),
      bankName: z
        .string({ required_error: 'Bank name is required' })
        .min(1, 'Bank name is required'),
      paymentMethodPreference: z
        .string({ required_error: 'Payment method is required' })
        .min(1, 'Payment method preference is required'),
    }),
  }),
});

const vendorValidations = {
  registerVendorValidationSchema,
};

export default vendorValidations;
