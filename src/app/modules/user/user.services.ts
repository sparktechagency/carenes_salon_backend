/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import { ICustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { USER_ROLE } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const registerCustomer = async (password: string, customerData: ICustomer) => {
  const user = await User.isUserExists(customerData?.email);
  if (user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This user already exists');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userData: Partial<TUser> = {
      email: customerData?.email,
      password: password,
      role: USER_ROLE.customer,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userData], { session });

    const customer = await Customer.create([customerData], { session });

    await session.commitTransaction();
    session.endSession();

    return customer[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const userServices = {
  registerCustomer,
};

export default userServices;
