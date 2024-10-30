/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { IStaff } from './staff.interface';
import Staff from './staff.model';
import BusinessHour from '../bussinessHour/businessHour.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';

const createStaffIntoDB = async (profileId: string, payload: IStaff) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create staff with session
    const [staff] = await Staff.create([{ ...payload, shop: profileId }], {
      session,
    });

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
      entityId: staff._id,
      entityType: 'Staff',
    }));

    // Create business hours with session
    await BusinessHour.create(defaultBusinessHours, { session });

    // Commit the transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    return staff;
  } catch (error) {
    // Roll back any changes made in the transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// update staff
const updateStaffIntoDB = async (id: string, payload: Partial<IStaff>) => {
  const staff = await Staff.findById(id);
  if (!staff) {
    throw new AppError(httpStatus.NOT_FOUND, 'Staff not found');
  }

  const result = await Staff.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteStaffFromDB = async (id: string) => {
  await Staff.findByIdAndDelete(id);
  await BusinessHour.deleteMany({ entityId: id, entityType: 'Staff' });
  return null;
};

// get all staff
const getAllStaff = async (query: Record<string, any>) => {
  const staffQuery = new QueryBuilder(Staff.find(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await staffQuery.countTotal();
  const result = await staffQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get my staff
const getMyStaff = async (shopId: string) => {
  const result = await Staff.find({ shop: shopId });
  return result;
};

// get available staff

const getAvailableStaff = async (payload: {
  shopId: string;
  services: string[];
}) => {
  const { shopId, services } = payload;
  // Find staff with matching shopId and whose services array includes all specified service IDs
  const result = await Staff.find({
    shop: shopId,
    $or: [
      { services: { $all: services } },  
      { services: "all-services" }     
    ]
  });

  return result;
};

const StaffServices = {
  createStaffIntoDB,
  updateStaffIntoDB,
  deleteStaffFromDB,
  getAllStaff,
  getMyStaff,
  getAvailableStaff,
};

export default StaffServices;
