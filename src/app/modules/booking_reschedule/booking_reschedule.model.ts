import { Schema, model } from "mongoose";
import { IBookingReschedule } from "./booking_reschedule.interface";

const BookingRescheduleSchema = new Schema<IBookingReschedule>({
    bookingId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Booking",
    },
    rescheduleDate: {
        type: Date,
    },
    rescheduleTime: {
        type: String,
    },
    shopId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Shop",
    },
    
}, {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields
});

export const RescheduleRequest = model("RescheduleRequest", BookingRescheduleSchema);
