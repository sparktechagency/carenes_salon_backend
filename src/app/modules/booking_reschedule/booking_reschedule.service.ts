import { JwtPayload } from 'jsonwebtoken';
import { IBookingReschedule } from './booking_reschedule.interface';
import Booking from '../booking/booking.model';
import { ENUM_NOTIFICATION_TYPE, ENUM_RESCHEDULE_TYPE } from '../../utilities/enum';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { USER_ROLE } from '../user/user.constant';
import Client from '../client/client.model';
import Customer from '../customer/customer.model';

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
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  const shop = await Client.findById(payload.shopId).select(
    'shopName shopImages',
  );
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const customer = await Customer.findById(booking.customerId).select(
    'firstName lastName profile_image',
  );

  const requestReceiver =
    userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;

  const notificationMessage =
    userData.role === USER_ROLE.client
      ? `${shop.shopName} requesting to cancel the booking`
      : `${customer?.firstName + ' ' + customer?.lastName} requesting to cancel the booking`;
const notificationImage = USER_ROLE.client ? `${shop?.shopImages[0]}`: `${customer?.profile_image}`;

const notificationData = {
    title:"Cancel Request",
    message: notificationMessage,
    image: notificationImage,
    receiver:requestReceiver,
    rescheduleId: booking._id,
    type: ENUM_NOTIFICATION_TYPE.CANCEL_BOOKING,   
}





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
