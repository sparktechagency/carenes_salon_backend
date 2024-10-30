import { model, Schema } from "mongoose";
import { IBooking } from "./booking.interface";

const BookingSchema = new Schema<IBooking>({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }], // Changed to an array
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['booked', 'completed', 'canceled'], default: 'booked' }
  }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  });

const Booking = model("Booking",BookingSchema);

export default Booking;