import { Schema, model, Types } from "mongoose";
import { ENUM_RESCHEDULE_TYPE } from "../../utilities/enum";

const BookingRescheduleSchema = new Schema({
    bookingId: {
        type: Types.ObjectId,
        required: true,
        ref: "Booking",
    },
    rescheduleDate: {
        type: Date,
    },
    rescheduleTime: {
        type: String,
    },
    type: {
        type: String,
        enum: Object.values(ENUM_RESCHEDULE_TYPE),
        required: true,
    },
    shopId: {
        type: Types.ObjectId,
        required: true,
        ref: "Shop",
    },
}, {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields
});

export const BookingReschedule = model("BookingReschedule", BookingRescheduleSchema);
