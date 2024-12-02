import { Types } from 'mongoose';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

export interface INotification {
  title: string;
  message: string;
  image: string;
  seen: boolean;
  receiver: string;
  type: keyof typeof ENUM_NOTIFICATION_TYPE;
  rescheduleId: Types.ObjectId;
  rescheduleDateTime: Date;
  bookingId: Types.ObjectId;
}
