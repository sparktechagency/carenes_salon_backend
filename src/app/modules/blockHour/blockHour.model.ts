import { model, Schema } from 'mongoose';
import { IBlockHour } from './blockHour.interface';

const blockHourSchema = new Schema<IBlockHour>({
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
