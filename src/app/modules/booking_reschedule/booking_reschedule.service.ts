import { JwtPayload } from 'jsonwebtoken';
import { IBookingReschedule } from './booking_reschedule.interface';
import Booking from '../booking/booking.model';
import {

} from '../../utilities/enum';
import AppError from '../../error/appError';
import httpStatus from 'http-status';


const createRescheduleRequest = async (
  userData: JwtPayload,
  payload: IBookingReschedule,
) => {
  const booking = await Booking.findById(payload.bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  const [startHours, startMinutes] = payload.rescheduleTime
    .split(':')
    .map(Number);
  const startDate = new Date(payload.rescheduleDate);
  startDate.setHours(startHours, startMinutes, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + booking.totalDuration);
  // Check for conflicting bookings
  const existingBookings = await Booking.find({
    staffId: booking.staffId,
    $and: [
      { startTime: { $lt: endDate }, endTime: { $gt: startDate } }, // Overlapping existing booking
    ],
  });
  //check operation
  if (existingBookings.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'The selected time slot is conflict with other booking. Please choose a different time',
    );
  }
};

const RescheduleRequestServices = {
    createRescheduleRequest,
};

export default RescheduleRequestServices;
