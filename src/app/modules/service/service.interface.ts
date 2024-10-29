import { Schema } from 'mongoose';

interface IService {
  shop: Schema.Types.ObjectId;
  serviceName: string;
  category: Schema.Types.ObjectId;
  shopCategory: Schema.Types.ObjectId;
  availableFor: 'Everyone' | 'Male' | 'Female';
  durationMinutes: number;
  price: number;
}

export default IService;
