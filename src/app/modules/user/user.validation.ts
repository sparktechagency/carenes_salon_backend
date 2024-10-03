import { z } from 'zod';
import { UserStatus } from './user.constant';

// Zod schema for user creation
export const registerUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().min(1, 'Phone number is required').max(15),
    passwordChangedAt: z.date().optional(),
    bankAccountName: z.string().optional().nullable(),
    bankAccountNumber: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    paymentMethodPreferences: z.string().optional().nullable(),
    role: z.enum(['user', 'rider', 'vendor', 'superAdmin']),
    status: z.enum([...UserStatus] as [string, ...string[]]),
    isDeleted: z.boolean().optional().default(false),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z.string({ required_error: 'Password is required' }),
  }),
});

// refresh token validation schema -----------
const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

// forget password validation schema
const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'User email is required' }),
  }),
});
// reset password validation schema
const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'User email is required' }),
    newPassword: z.string({ required_error: 'New password is required' }),
  }),
});

const userValidations = {
  registerUserValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};

export default userValidations;
