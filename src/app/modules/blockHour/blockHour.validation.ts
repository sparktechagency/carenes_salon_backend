import { z } from 'zod';

const createBlockHourValidationSchema = z.object({
  body:z.object({
    entityId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ObjectId format' }),
  entityType: z.enum(['Shop', 'Staff']),
  day: z.enum([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format (24-hour).',
  }),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format (24-hour).',
  }),
  })
});

const blockHourValidations = {
  createBlockHourValidationSchema,
};

export default blockHourValidations;
