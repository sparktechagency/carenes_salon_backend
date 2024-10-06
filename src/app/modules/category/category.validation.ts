import { z } from 'zod';

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});
const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .optional(),
    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});

export const createSubCategoryValidationSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is requied' }),
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),

    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});
export const updateSubCategoryValidationSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is requied' }).optional(),
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .optional(),
    image: z
      .string()
      .url('Image must be a valid URL')
      .min(1, 'Image is required')
      .optional(),
  }),
});

const categoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};

export default categoryValidation;
