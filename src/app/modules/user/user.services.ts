/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import { ICustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { USER_ROLE } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { IRider } from '../rider/rider.interface';
import Rider from '../rider/rider.model';
import { IVendor } from '../vendor/vendor.interface';
import Vendor from '../vendor/vendor.model';
import sendSMS from '../../helper/sendSms';

const generateVerifyCode = (): number => {
  return Math.floor(10000 + Math.random() * 90000);
};

const registerCustomer = async (
  password: string,
  confirmPassword: string,
  customerData: ICustomer,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }
  const user = await User.isUserExists(customerData?.phoneNumber);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userData: Partial<TUser> = {
      email: customerData?.email,
      phoneNumber: customerData?.phoneNumber,
      password: password,
      role: USER_ROLE.customer,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });

    const smsMessage = `Your verification code is: ${verifyCode}`;
    await sendSMS(customerData?.phoneNumber, smsMessage);

    const customerPayload = {
      ...customerData,
      user: user[0]._id,
    };
    const customer = await Customer.create([customerPayload], { session });

    await session.commitTransaction();
    session.endSession();

    return customer[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// register rider
const registerRider = async (
  password: string,
  confirmPassword: string,
  riderData: IRider,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }
  const rider = await User.isUserExists(riderData?.email);
  if (rider) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userData: Partial<TUser> = {
      email: riderData?.email,
      phoneNumber: riderData?.phoneNumber,
      password: password,
      role: USER_ROLE.rider,
      isActive: false,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });

    const smsMessage = `Your verification code is: ${verifyCode}`;
    await sendSMS(riderData?.phoneNumber, smsMessage);
    const riderPayload = {
      ...riderData,
      user: user[0]._id,
    };
    const rider = await Rider.create([riderPayload], { session });

    await session.commitTransaction();
    session.endSession();

    return rider[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// register vendor
const registerVendor = async (
  password: string,
  confirmPassword: string,
  vendorData: IVendor,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }
  const rider = await User.isUserExists(vendorData?.email);
  if (rider) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userData: Partial<TUser> = {
      email: vendorData?.email,
      phoneNumber: vendorData?.phoneNumber,
      password: password,
      role: USER_ROLE.vendor,
      isActive: false,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });
    const smsMessage = `Your verification code is: ${verifyCode}`;
    await sendSMS(vendorData?.phoneNumber, smsMessage);
    const vendorPayload = {
      ...vendorData,
      user: user[0]._id,
    };
    const vendor = await Vendor.create([vendorPayload], { session });

    await session.commitTransaction();
    session.endSession();

    return vendor[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyProfile = async (phoneNumber: string, role: string) => {
  let result = null;
  if (role === USER_ROLE.customer) {
    result = await Customer.findOne({ phoneNumber });
  }
  if (role === USER_ROLE.rider) {
    result = await Rider.findOne({ phoneNumber });
  }
  if (role === USER_ROLE.vendor) {
    result = await Vendor.findOne({ phoneNumber });
  }
  return result;
};

const verifyCode = async (phoneNumber: string, verifyCode: number) => {
  const user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  let result;
  if (user.verifyCode === verifyCode) {
    result = await User.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { isVerified: true },
      { new: true, runValidators: true },
    );
  }
  return result;
};

const resendVerifyCode = async (phoneNumber: string) => {
  const user = await User.findOne({ phoneNumber: phoneNumber });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { phoneNumber: phoneNumber },
    { verifyCode: verifyCode },
  );
  const smsMessage = `Your verification code is: ${updateUser?.verifyCode}`;
  await sendSMS(user?.phoneNumber, smsMessage);
};

const userServices = {
  registerCustomer,
  registerRider,
  registerVendor,
  getMyProfile,
  verifyCode,
  resendVerifyCode,
};

export default userServices;
