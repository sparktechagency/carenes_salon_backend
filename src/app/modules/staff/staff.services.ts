import mongoose from 'mongoose';
import { IStaff } from './staff.interface';
import Staff from './staff.model';
import BusinessHour from '../bussinessHour/businessHour.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createStaffIntoDB = async (payload: IStaff) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create staff with session
    const [staff] = await Staff.create([payload], { session });

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

const StaffServices = {
  createStaffIntoDB,
  updateStaffIntoDB,
  deleteStaffFromDB,
};

export default StaffServices;
