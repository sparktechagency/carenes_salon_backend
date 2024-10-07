/* eslint-disable @typescript-eslint/no-explicit-any */

import Business from './vendor.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IVendor } from './vendor.interface';
import Vendor from './vendor.model';
import { User } from '../user/user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

// get all business-------------

const getAllBusiness = async (query: Record<string, any>) => {
  const businessQuery = new QueryBuilder(Business.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await businessQuery.countTotal();
  const result = await businessQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get single business from db
const getSingleBusinessFromDB = async (id: string) => {
  const result = await Business.findById(id);
  return result;
};

const updateVendorProfile = async (
  userId: string,
  payload: Partial<IVendor>,
) => {
  const result = await Vendor.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

// update vendor status
const updateShopStatus = async (id: string, status: string) => {
  const session = await Vendor.startSession();
  session.startTransaction();

  try {
    const result = await Vendor.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Vendor not found');
    }

    const isActive = status === 'activate';

    await User.findOneAndUpdate(
      { _id: result.user },
      { isActive: isActive },
      { runValidators: true, new: true, session: session },
    );

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Something went wrong ,try again letter ',
    );
  }
};

const vendorServices = {
  getAllBusiness,
  getSingleBusinessFromDB,
  updateVendorProfile,
  updateShopStatus,
};

export default vendorServices;
