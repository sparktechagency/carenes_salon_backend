import { Types } from "mongoose";
import { ENUM_NOTIFICATION_TYPE } from "../../utilities/enum";

export interface INotification {
  title: string;
  message: string;
  image:string;
  seen: boolean;
  receiver: string;
  status: keyof typeof ENUM_NOTIFICATION_TYPE,
  rescheduleId:Types.ObjectId;
}
