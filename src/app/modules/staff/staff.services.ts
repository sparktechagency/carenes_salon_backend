import mongoose from 'mongoose';
import { IStaff } from './staff.interface';
import Staff from './staff.model';
import BusinessHour from '../bussinessHour/businessHour.model';

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

const StaffServices = {
  createStaffIntoDB,
};

export default StaffServices;
