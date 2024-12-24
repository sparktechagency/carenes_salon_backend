/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import BlockHour from '../blockHour/blockHour.model';
import Booking from '../booking/booking.model';
import Staff from '../staff/staff.model';
import { IBusinessHour } from './businessHour.interface';
import BusinessHour from './businessHour.model';

const getAvailableDates = async (staffId: string) => {
  const today = new Date();
  const nextFiveDays = [];

  const staff = await Staff.findById(staffId);
  if (!staff) throw new Error('Staff not found');

  const shopHours = await BusinessHour.find({
    entityId: staff.shop,
    entityType: 'Shop',
  });
  const staffHours = await BusinessHour.find({
    entityId: staffId,
    entityType: 'Staff',
  });

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });

    const shopDayHours = shopHours.find((hour) => hour.day === day);
    const staffDayHours = staffHours.find((hour) => hour.day === day);

    if (
      shopDayHours &&
      staffDayHours &&
      !shopDayHours.isClosed &&
      !staffDayHours.isClosed
    ) {
      nextFiveDays.push({
        date: date.toISOString().split('T')[0],
        day,
        isAvailable: true,
        openTime: staffDayHours.openTime,
        closeTime: staffDayHours.closeTime,
      });
    } else {
      nextFiveDays.push({
        date: date.toISOString().split('T')[0],
        day,
        isAvailable: false,
      });
    }
  }
  return nextFiveDays;
};

// get available slots

const getAvailableTimeSlots = async (staffId: string, date: string) => {
  const staff = await Staff.findById(staffId);
  // const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  const day = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC', // Ensures it interprets the date as UTC
  });
  const staffHours = await BusinessHour.findOne({
    entityId: staffId,
    entityType: 'Staff',
    day,
  });

  // Check if staff hours are available or if staff is closed-------------
  if (!staffHours || staffHours.isClosed) return { availableSlots: [] };

  // Create open and close time in local time
  //   const openTime = new Date(date);
  // openTime.setHours(parseInt(staffHours.openTime.split(':')[0]), parseInt(staffHours.openTime.split(':')[1]), 0, 0);

  //   const closeTime = new Date(date);
  // closeTime.setHours(parseInt(staffHours.closeTime.split(':')[0]), parseInt(staffHours.closeTime.split(':')[1]), 0, 0);

  // for testing------------------
  const openTime = new Date(`${date}T${staffHours.openTime}`);
  const closeTime = new Date(`${date}T${staffHours.closeTime}`);

  // Fetch blocked hours and existing bookings
  const blockHours = await BlockHour.find({
    entityId: staffId,
    entityType: 'Staff',
    day,
  });
  const businessBlockHour = await BlockHour.find({
    entityId: staff?.shop,
    entityType: 'Shop',
    day,
  });

  const existingBookings = await Booking.find({
    staffId,
    startTime: { $gte: openTime, $lt: closeTime },
  });
  const availableSlots = [];
  let slotStart = new Date(openTime);

  // Generate available time slots in 30-minute intervals
  while (slotStart < closeTime) {
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 15);

    // const isBlocked = blockHours.some(
    //   (bh) =>
    //     slotStart.toISOString().slice(11, 16) >= bh.startTime &&
    //     slotStart.toISOString().slice(11, 16) < bh.endTime,
    // );
    const isBlocked = blockHours.some(
      (bh) =>
        slotStart.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }) >= bh.startTime &&
        slotStart.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }) < bh.endTime,
    );
    const isBlocked2 = businessBlockHour.some(
      (bh) =>
        slotStart.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }) >= bh.startTime &&
        slotStart.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }) < bh.endTime,
    );

    const isBooked = existingBookings.some(
      (b) => slotStart < b.endTime && slotEnd > b.startTime,
    );

    // Push slot information with isBooked status
    if (!isBlocked && !isBlocked2) {
      availableSlots.push({
        time: slotStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        isBooked: isBooked, // true or false based on booking status
      });
    }
    slotStart = slotEnd;
  }

  return availableSlots;
};

const getBusinessHour = async (entityId: string, entityType: string) => {
  // Fetch business hours
  const businessHours = await BusinessHour.find({ entityId, entityType });

  // Fetch block hours
  const blockHours = await BlockHour.find({ entityId, entityType });

  // Combine business hours and block hours by day
  const result = businessHours.map((bh) => {
    // Get block hours for the specific day
    const blocksForDay = blockHours
      .filter((bhBlock) => bhBlock.day === bh.day)
      .map((bhBlock) => ({
        startTime: bhBlock.startTime,
        endTime: bhBlock.endTime,
        _id: bhBlock._id,
      }));

    return {
      ...bh.toObject(),
      blockHours: blocksForDay,
    };
  });

  return result;
};

const updateBusinessHour = async (
  id: string,
  payload: Partial<IBusinessHour>,
) => {
  const businessHour = await BusinessHour.findById(id);
  const { day, entityId, entityType, ...updatedPayload } = payload;

  if (!businessHour) {
    throw new AppError(httpStatus.NOT_FOUND, 'Business hour not found');
  }
  const result = await BusinessHour.findByIdAndUpdate(id, updatedPayload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const BusinessHourServices = {
  getAvailableDates,
  getAvailableTimeSlots,
  getBusinessHour,
  updateBusinessHour,
};

export default BusinessHourServices;
