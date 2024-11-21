import { model, Schema } from 'mongoose';
import { INotification } from './notification.interface';

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
    image: {
      type: String,
      required: false,
    },
    receiver: {
      type: String,
      required: true,
    },
    rescheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Reschedule',
      required: false,
    },
    rescheduleDateTime: {
      type: Date,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
    },
  },

  {
    timestamps: true,
  },
);

const Notification = model('Notification', notificationSchema);

export default Notification;
