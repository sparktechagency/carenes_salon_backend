import { z } from 'zod';

const locationValidationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).min(2).max(2),
});

const createOrderValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    deliveryLocation: locationValidationSchema,

    Client: z.string().optional().nullable(),
  }),
});

const getNearbyByOrderValidationSchema = z.object({
  body: z.object({
    latitude: z.number({ required_error: 'Latitude is required' }),
    longitude: z.number({ required_error: 'Longitude is required' }),
  }),
});

const orderValidations = {
  createOrderValidationSchema,
  getNearbyByOrderValidationSchema,
};

export default orderValidations;
