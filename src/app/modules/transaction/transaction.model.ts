import { model, Schema } from 'mongoose';
import { ITransaction } from './transaction.interface';
import { ENUM_PAYMENT_METHOD } from '../../utilities/enum';

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
    paymentMethod: {
      type: String,
      enum: Object.values(ENUM_PAYMENT_METHOD),
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const Transaction = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
