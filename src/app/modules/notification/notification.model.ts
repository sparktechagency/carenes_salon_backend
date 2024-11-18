import { model, Schema } from 'mongoose';
import { INotification } from './notification.interface';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    receiver: {
      type: String,
      required: true,
    },
    type:{
      type:String,
      enum:Object.values(ENUM_NOTIFICATION_TYPE),
      required:true,
    }
  },

  {
    timestamps: true,
  },
);

const Notification = model('Notification', notificationSchema);

export default Notification;
