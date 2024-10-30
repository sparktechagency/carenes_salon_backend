import { z } from "zod";

const getBusinessHourValidationSchema = z.object({
    body:z.object({
        entityId:z.string({required_error:"Entity id is required"}),
        entityType:z.string({required_error:"Entity type is required"})
    })
})

const updateBusinessHourSchema = z.object({
   body:z.object({
    day: z.enum([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]).optional(),
      openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid open time format").optional(), // Format: HH:mm
      closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid close time format").optional(), // Format: HH:mm
      isClosed: z.boolean().optional(),
   })
  });


const businessHourValidations = {
    getBusinessHourValidationSchema,
    updateBusinessHourSchema
}

export default businessHourValidations;