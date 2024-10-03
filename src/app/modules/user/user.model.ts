import { Schema, model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { UserStatus } from './user.constant';

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    bankAccountName: {
      type: String,
    },
    bankAccountNumber: {
      type: String,
    },
    bankName: {
      type: String,
    },
    paymentMethodPreferences: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'superAdmin'],
    },
    status: {
      type: String,
      enum: UserStatus,
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set empty string after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});
// statics method for check is user exists
userSchema.statics.isUserExists = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};
// statics method for check is user isDeleted
userSchema.statics.isUserDeleted = async function (email: string) {
  const user = await User.findOne({ email });
  return user?.isDeleted;
};
// statics method for check is user is blocked
userSchema.statics.isUserBlocked = async function (email: string) {
  const user = await User.findOne({ email });
  return user?.status === 'blocked';
};
// statics method for check password match  ----
userSchema.statics.isPasswordMatched = async function (
  plainPasswords: string,
  hashPassword: string,
) {
  return await bcrypt.compare(plainPasswords, hashPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChange = async function (
  passwordChangeTimeStamp,
  jwtIssuedTimeStamp,
) {
  const passwordChangeTime = new Date(passwordChangeTimeStamp).getTime() / 1000;

  return passwordChangeTime > jwtIssuedTimeStamp;
};
export const User = model<TUser, UserModel>('User', userSchema);
