import { model, Schema } from 'mongoose';
import { ITransaction } from './transaction.interface';

const transactionSchema = new Schema<ITransaction>(
  {
    senderEntityId: {
      type: Schema.Types.ObjectId,
      refPath: 'senderEntityType',
    },
    receiverEntityId: {
      type: Schema.Types.ObjectId,
      refPath: 'receiverEntityType',
    },
    senderEntityType: {
      type: String,
      enum: ['Customer', 'Client'],
      //   required: true,
    },
    receiverEntityType: {
      type: String,
      enum: ['Customer', 'Client'],
      //   required: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['Booking', 'Refund', 'Shop Charge'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const Transaction = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
