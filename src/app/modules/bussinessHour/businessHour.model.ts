import { model, Schema } from 'mongoose';
import { IBusinessHour } from './businessHour.interface';

const businessHourSchema = new Schema<IBusinessHour>({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType',
  },
  entityType: { type: String, enum: ['Shop', 'Staff'], required: true },
  day: {
    type: String,
    enum: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    required: true,
  },
  openTime: { type: String }, // Format: "HH:mm"
  closeTime: { type: String },
  isClosed: { type: Boolean, default: false },
});

const BusinessHour = model('BusinessHour', businessHourSchema);

export default BusinessHour;
