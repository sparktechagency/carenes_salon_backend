import { Types } from "mongoose";
import { ENUM_RESCHEDULE_TYPE } from "../../utilities/enum";

export interface IBookingReschedule {
    bookingId: Types.ObjectId;
    rescheduleDate?: Date;
    rescheduleTime?: string;
    type:(typeof ENUM_RESCHEDULE_TYPE )[keyof typeof ENUM_RESCHEDULE_TYPE];
    shopId: Types.ObjectId;

}