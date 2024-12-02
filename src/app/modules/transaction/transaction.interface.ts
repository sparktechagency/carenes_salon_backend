import { Types } from 'mongoose';

export interface ITransaction {
  senderEntityId?: Types.ObjectId;
  receiverEntityId?: Types.ObjectId;
  senderEntityType?: 'Customer' | 'Client';
  receiverEntityType?: 'Customer' | 'Client';
  amount: number;
  type: 'Booking' | 'Refund' | 'Shop Charge';
}
