import { z } from "zod";

const getBusinessHourValidationSchema = z.object({
    body:z.object({
        entityId:z.string({required_error:"Entity id is required"}),
        entityType:z.string({required_error:"Entity type is required"})
    })
})


const businessHourValidations = {
    getBusinessHourValidationSchema
}

export default businessHourValidations;