/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import { ICustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { USER_ROLE } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import sendSMS from '../../helper/sendSms';
import { IClient } from '../client/client.interface';
import Client from '../client/client.model';
import { IAdmin } from '../admin/admin.interface';
import Admin from '../admin/admin.model';
import BusinessHour from '../bussinessHour/businessHour.model';
import sendEmail from '../../utilities/sendEmail';
import registrationSuccessEmailBody from '../../mailTemplete/registerSuccessEmail';

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
  const user = await User.isUserExists(customerData.email);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userData: Partial<TUser> = {
      email: customerData?.email,
      password: password,
      role: USER_ROLE.customer,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });

    const customerPayload = {
      ...customerData,
      user: user[0]._id,
    };
    const customer = await Customer.create([customerPayload], { session });

    sendEmail({
      email: user[0].email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(
        customer[0].firstName,
        user[0].verifyCode,
      ),
    });

    await session.commitTransaction();
    session.endSession();

    return customer[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const registerClient = async (
  password: string,
  confirmPassword: string,
  clientData: IClient,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }

  const clientExists = await User.isUserExists(clientData?.email);
  if (clientExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userData: Partial<TUser> = {
      email: clientData?.email,
      password: password,
      role: USER_ROLE.client,
      isActive: false,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 5 * 60000),
    };

    const user = await User.create([userData], { session });

    const clientPayload = {
      ...clientData,
      user: user[0]._id,
    };
    const client = await Client.create([clientPayload], { session });

    // Define default business hours (Sunday closed, other days 9:00 AM - 6:00 PM)
    const defaultBusinessHours = [
      { day: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      {
        day: 'Tuesday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Wednesday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      {
        day: 'Thursday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      { day: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
      {
        day: 'Saturday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
      { day: 'Sunday', openTime: '09:00', closeTime: '18:00', isClosed: true },
    ].map((hour) => ({
      ...hour,
      entityId: client[0]._id, // Associate business hours with the created client
      entityType: 'Shop', // Assuming client is a Shop entity
    }));

    // Create default business hours for the client
    await BusinessHour.create(defaultBusinessHours, { session });

    sendEmail({
      email: user[0].email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(
        client[0].firstName,
        user[0].verifyCode,
      ),
    });

    await session.commitTransaction();
    session.endSession();

    return client[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// register Admin
const registerAdmin = async (password: string, adminData: IAdmin) => {
  const admin = await User.isUserExists(adminData?.email);
  if (admin) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This admin already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userData: Partial<TUser> = {
      email: adminData?.email,
      phoneNumber: adminData?.phoneNumber,
      password: password,
      role: USER_ROLE.admin,
      isActive: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });

    const adminPayload = {
      ...adminData,
      user: user[0]._id,
    };
    const admin = await Admin.create([adminPayload], { session });

    await session.commitTransaction();
    session.endSession();

    return admin[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyProfile = async (email: string, role: string) => {
  let result = null;
  if (role === USER_ROLE.customer) {
    result = await Customer.findOne({ email: email });
  }
  if (role === USER_ROLE.client) {
    result = await Client.findOne({ email: email });
  }
  if (role === USER_ROLE.admin) {
    result = await Admin.findOne({ email: email });
  }
  return result;
};

const verifyCode = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }
  let result;
  if (user.verifyCode === verifyCode) {
    result = await User.findOneAndUpdate(
      { email: email },
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
    { verifyCode: verifyCode, codeExpireIn: new Date(Date.now() + 5 * 60000) },
  );
  const smsMessage = `Your verification code is: ${updateUser?.verifyCode}`;
  await sendSMS(user?.phoneNumber, smsMessage);
};

// block , unblock user
const blockUnblockUser = async (id: string, status: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );

  return result;
};

const userServices = {
  registerCustomer,
  registerClient,
  registerAdmin,
  getMyProfile,
  verifyCode,
  resendVerifyCode,
  blockUnblockUser,
};

export default userServices;
