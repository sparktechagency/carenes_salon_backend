import { model, Schema } from 'mongoose';
import { IRider } from './rider.interface';

const riderSchema = new Schema<IRider>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    drivingLicence: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    paymentMethodPreference: { type: String, required: true },
  },
  { timestamps: true },
);

const Rider = model('Rider', riderSchema);

export default Rider;
