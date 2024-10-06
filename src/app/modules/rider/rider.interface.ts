import { Types } from 'mongoose';

export interface IRider {
  user: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  drivingLicence: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  paymentMethodPreference: string;
  isDeleted: boolean;
}
