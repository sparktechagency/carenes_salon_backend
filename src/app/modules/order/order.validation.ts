import { z } from 'zod';

const locationValidationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).min(2).max(2),
});

// const orderItemValidationSchema = z.object({
//   product: z.string().min(1, 'Product ID is required'),
//   quantity: z.number().min(1, 'Quantity must be at least 1'),
// });

const createOrderValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    deliveryLocation: locationValidationSchema,
    // items: z
    //   .array(orderItemValidationSchema)
    //   .min(1, 'At least one item is required'),
    // totalQuantity: z.number().min(1, 'Total quantity must be at least 1'),
    // totalPrice: z.number().min(0, 'Total price must be at least 0'),
    rider: z.string().optional().nullable(),
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
