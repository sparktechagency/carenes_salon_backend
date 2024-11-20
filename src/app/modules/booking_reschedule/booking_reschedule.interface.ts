import { Types } from "mongoose";
import { ENUM_RESCHEDULE_STATUS } from "../../utilities/enum";

export interface IBookingReschedule {
    bookingId: Types.ObjectId;
    rescheduleDate?: Date;
    rescheduleTime?: string;
    status: keyof typeof ENUM_RESCHEDULE_STATUS
    shopId: Types.ObjectId;

}