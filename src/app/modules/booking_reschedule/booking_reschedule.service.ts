/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { IBookingReschedule } from './booking_reschedule.interface';
import Booking from '../booking/booking.model';
import {
  ENUM_NOTIFICATION_TYPE,
  //   ENUM_RESCHEDULE_STATUS,
} from '../../utilities/enum';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import Client from '../client/client.model';
import Customer from '../customer/customer.model';
import { USER_ROLE } from '../user/user.constant';
import Notification from '../notification/notification.model';
// import { RescheduleRequest } from './booking_reschedule.model';

const createRescheduleRequest = async (
  userData: JwtPayload,
  payload: IBookingReschedule,
) => {
  const booking = await Booking.findById(payload.bookingId);
  if (!booking) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Booking not found');
  }
  const shop = await Client.findById(booking.shopId).select(
    'shopName shopImages',
  );
  const customer = await Customer.findById(booking.customerId);
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

  const requestReceiver =
    userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;

  const formatDate = (date: any) => {
    const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
  };

  const formatTime = (date: any) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours > 12 ? hours - 12 : hours}:${minutes} ${
      hours >= 12 ? 'pm' : 'am'
    }`;
  };

  const formattedDate = formatDate(startDate); // e.g., "12/02/24"
  const formattedTime = formatTime(startDate); // e.g., "5:00 pm"

  // Creating the notification message
  const notificationMessage =
    userData.role === USER_ROLE.client
      ? `${shop.shopName} requesting to reschedule the booking on ${formattedDate} at ${formattedTime}.`
      : `${
          customer?.firstName + ' ' + customer?.lastName
        } requesting to reschedule the booking on ${formattedDate} at ${formattedTime}.`;
  const notificationImage = USER_ROLE.client
    ? `${shop?.shopImages[0]}`
    : `${customer?.profile_image}`;
  //   const rescheduleRequest = await RescheduleRequest.create({
  //     bookingId: booking._id,
  //     rescheduleDate: startDate,
  //     status: ENUM_RESCHEDULE_STATUS.PENDING,
  //   });
  const notificationData = {
    title: 'Reschedule Request',
    message: notificationMessage,
    image: notificationImage,
    receiver: requestReceiver,
    type: ENUM_NOTIFICATION_TYPE.RESCHEDULE_BOOKING,
    bookingId: booking._id,
    rescheduleDateTime:startDate
    // rescheduleId: rescheduleRequest._id,
  };

  // Create notification for the receiver
  await Notification.create(notificationData);
};

const changeRescheduleRequestStatus = async (
  userData: JwtPayload,
  notificationId: string,
  status: string,
) => {
  let result;
  if (status === 'accept') {
    result = await acceptRescheduleRequest(userData, notificationId);
  } else {
    result = await rejectRescheduleRequest(userData, notificationId);
  }

  return result;
};

const acceptRescheduleRequest = async (
  userData: JwtPayload,
  notificationId: string,
) => {};

const rejectRescheduleRequest = async (
  userData: JwtPayload,
  notificationId: string,
) => {

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
    }
    const booking = await Booking.findById(notification.bookingId);
  
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }
    const shop = await Client.findById(booking.shopId).select(
      'shopName shopImages',
    );
  
    const customer = await Customer.findById(booking.customerId).select(
      'firstName lastName profile_image',
    );
  
    await Notification.findByIdAndDelete(notificationId);
    const requestReceiver =
      userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;
    const notificationMessage =
      userData.role === USER_ROLE.client
        ? `${shop.shopName} reject your reschedule request`
        : `${
            customer?.firstName + ' ' + customer?.lastName
          } reject your reschedule request`;
    const notificationImage = USER_ROLE.client
      ? `${shop?.shopImages[0]}`
      : `${customer?.profile_image}`;
    const notificationData = {
      title: 'Reject Reschedule Request',
      message: notificationMessage,
      image: notificationImage,
      receiver: requestReceiver,
      bookingId: booking._id,
      type: ENUM_NOTIFICATION_TYPE.REJECT_REQUEST,
    };
  
    await Notification.create(notificationData);

};

const RescheduleRequestServices = {
  createRescheduleRequest,
  changeRescheduleRequestStatus
};

export default RescheduleRequestServices;
