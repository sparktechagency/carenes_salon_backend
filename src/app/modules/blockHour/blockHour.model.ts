import { model, Schema } from 'mongoose';

const blockHourSchema = new Schema({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType',
  },
  entityType: { type: String, enum: ['Shop', 'Staff'], required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const BlockHour = model('BlockHour', blockHourSchema);

export default BlockHour;
