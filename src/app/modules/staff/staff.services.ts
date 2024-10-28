import mongoose from 'mongoose';
import { IStaff } from './staff.interface';
import Staff from './staff.model';
import BusinessHour from '../bussinessHour/businessHour.model';

const createStaffIntoDB = async (payload: IStaff) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const staff = await Staff.create([payload], { session });

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
      entityId: staff[0]._id,
      entityType: 'Staff',
    }));

    await BusinessHour.create(defaultBusinessHours);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const StaffServices = {
  createStaffIntoDB,
};

export default StaffServices;
