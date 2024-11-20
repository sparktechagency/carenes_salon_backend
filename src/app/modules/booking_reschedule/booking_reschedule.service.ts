import { JwtPayload } from 'jsonwebtoken';
import { IBookingReschedule } from './booking_reschedule.interface';
import Booking from '../booking/booking.model';
import { ENUM_RESCHEDULE_TYPE } from '../../utilities/enum';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const createRescheduleRequest = async (
  userData: JwtPayload,
  payload: IBookingReschedule,
) => {
  let result;
  if (payload.type === ENUM_RESCHEDULE_TYPE.CANCEL) {
    result = await handleCancelBookingRequest(userData, payload);
  } else {
    result = await handleRescheduleBookingRequest(userData, payload);
  }

  return result;
};

const handleCancelBookingRequest = async (
  userData: JwtPayload,
  payload: IBookingReschedule,
) => {
  const booking = await Booking.findById(payload.bookingId);
};

const handleRescheduleBookingRequest = async (
  userData: JwtPayload,
  payload: IBookingReschedule,
) => {
  if (!payload.rescheduleDate || !payload.rescheduleTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'For reschedule need to provide the reschedule date and time',
    );
  }
  const booking = await Booking.findById(payload.bookingId);
  const [startHours, startMinutes] = payload.rescheduleTime
    .split(':')
    .map(Number);
  const startDate = new Date(payload.rescheduleDate);
  startDate.setHours(startHours, startMinutes, 0);
};

const RescheduleRequestServices = {
  createRescheduleRequest,
};

export default RescheduleRequestServices;
