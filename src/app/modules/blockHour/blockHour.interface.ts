import { Types } from 'mongoose';

export interface IBlockHour {
  entityId: Types.ObjectId;
  entityType: 'Shop' | 'Staff';
  day: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}
