/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import AppError from '../../error/appError';
import calculateTotalServiceTime from '../../helper/calculateTotalServiceTime';
import BlockHour from '../blockHour/blockHour.model';
import Discount from '../discount/discount.model';
import Service from '../service/service.model';
import Booking from './booking.model';
import {
  ENUM_BOOKING_PAYMENT,
  ENUM_NOTIFICATION_TYPE,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_STATUS,
} from '../../utilities/enum';
import Client from '../client/client.model';
import QueryBuilder from '../../builder/QueryBuilder';
import Stripe from 'stripe';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import Customer from '../customer/customer.model';
import { USER_ROLE } from '../user/user.constant';
import Notification from '../notification/notification.model';
import PaypalService from '../paypal/paypal.service';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
// const createBooking = async (customerId: string, payload: any) => {
//   const { serviceIds, date, startTime, shopId } = payload;

//   // Fetch current date for discount comparison
//   const now = new Date();

//   // Fetch services with their applicable prices
//   const servicesWithPrices = await Promise.all(
//     serviceIds.map(async (serviceId: string) => {
//       const service = await Service.findById(serviceId).select('price');
//       if (!service) throw new Error(`Service with ID ${serviceId} not found`);

//       // Check for an active discount
//       const discount = await Discount.findOne({
//         shop: shopId,
//         discountStartDate: { $lte: now },
//         discountEndDate: { $gte: now },
//         $or: [{ services: 'all-services' }, { services: service._id }],
//       });

//       // Calculate discount price if discount applies; otherwise, use original price
//       const price = discount
//         ? service.price - (service.price * discount.discountPercentage) / 100
//         : service.price;

//       return { serviceId: service._id, price };
//     })
//   );

//   // Calculate the total price of the selected services
//   const totalPrice = servicesWithPrices.reduce((total, service) => total + service.price, 0);

//   // Calculate the total time for selected services
//   const totalDuration = await calculateTotalServiceTime(serviceIds);

//   // Create the start date in local time
//   const [startHours, startMinutes] = startTime.split(':').map(Number);
//   const startDate = new Date(date);
//   startDate.setHours(startHours, startMinutes, 0);

//   // Create the end date based on total duration
//   const endDate = new Date(startDate);
//   endDate.setMinutes(startDate.getMinutes() + totalDuration);

//   // Check for conflicting bookings
//   const existingBookings = await Booking.find({
//     staffId: payload.staffId,
//     $or: [
//       { startTime: { $lt: endDate }, endTime: { $gt: startDate } }, // Overlapping existing booking
//     ],
//   });

//   if (existingBookings.length > 0) {
//     throw new AppError(
//       httpStatus.CONFLICT,
//       'The selected time slot is conflict with other booking. Please choose a different time.'
//     );
//   }

//   // Fetch blocked hours for the staff and shop
//   const blockHours = await BlockHour.find({
//     entityId: payload.staffId,
//     entityType: 'Staff',
//     day: new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
//   });

//   const businessBlockHour = await BlockHour.find({
//     entityId: shopId,
//     entityType: 'Shop',
//     day: new Date(date).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }),
//   });

//   // Check if the selected time is within a blocked hour
//   const isBlocked = blockHours.some(
//     (bh) =>
//       startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) >= bh.startTime &&
//       startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) < bh.endTime
//   );

//   const isBusinessBlocked = businessBlockHour.some(
//     (bh) =>
//       startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) >= bh.startTime &&
//       startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) < bh.endTime
//   );

//   if (isBlocked || isBusinessBlocked) {
//     throw new Error('The selected time slot is blocked. Please choose a different time.');
//   }

//   // Create the booking with total price and service details
//   const result = await Booking.create({
//     ...payload,
//     startTime: startDate,
//     endTime: endDate,
//     customerId,
//     services: servicesWithPrices,
//     totalPrice, // Store the total price in the booking
//   });

//   return result;
// };
const createPayOnShopBooking = async (customerId: string, payload: any) => {
  const { serviceIds, date, startTime, shopId } = payload;
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found');
  }
  // Fetch current date for discount comparison
  const now = new Date();

  // Fetch services with their applicable prices
  const servicesWithPrices = await Promise.all(
    serviceIds.map(async (serviceId: string) => {
      const service = await Service.findById(serviceId).select('price');
      if (!service) throw new Error(`Service with ID ${serviceId} not found`);

      // Check for an active discount
      const discount = await Discount.findOne({
        shop: shopId,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
        $or: [{ services: 'all-services' }, { services: service._id }],
      });

      // Calculate discount price if discount applies; otherwise, use original price
      const price = discount
        ? service.price - (service.price * discount.discountPercentage) / 100
        : service.price;

      return { serviceId: service._id, price };
    }),
  );

  // Calculate the total price of the selected services
  const totalPrice = servicesWithPrices.reduce(
    (total, service) => total + service.price,
    0,
  );

  // Calculate the total time for selected services
  const totalDuration = await calculateTotalServiceTime(serviceIds);

  // Create the start date in local time
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const startDate = new Date(date);
  startDate.setHours(startHours, startMinutes, 0);

  // Create the end date based on total duration
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + totalDuration);

  // Check for conflicting bookings
  const existingBookings = await Booking.find({
    staffId: payload.staffId,
    $and: [
      { startTime: { $lt: endDate }, endTime: { $gt: startDate } }, // Overlapping existing booking
    ],
  });

  if (existingBookings.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'The selected time slot is conflict with other booking. Please choose a different time.',
    );
  }

  // Fetch blocked hours for the staff and shop
  const blockHours = await BlockHour.find({
    entityId: payload.staffId,
    entityType: 'Staff',
    day: new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }),
  });

  const businessBlockHour = await BlockHour.find({
    entityId: shopId,
    entityType: 'Shop',
    day: new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }),
  });

  // Check if the selected time is within a blocked hour
  const isBlocked = blockHours.some(
    (bh) =>
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) >= bh.startTime &&
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) < bh.endTime,
  );

  const isBusinessBlocked = businessBlockHour.some(
    (bh) =>
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) >= bh.startTime &&
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) < bh.endTime,
  );

  if (isBlocked || isBusinessBlocked) {
    throw new Error(
      'The selected time slot is blocked. Please choose a different time.',
    );
  }

  // Create the booking with total price and service details
  const result = await Booking.create({
    ...payload,
    shopCategoryId: shop.shopCategoryId,
    startTime: startDate,
    endTime: endDate,
    customerId,
    services: servicesWithPrices,
    paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP,
    totalPrice, // Store the total price in the booking
    totalDuration,
  });

  await Client.findByIdAndUpdate(
    shopId,
    { $inc: { payOnShopChargeDueAmount: 0.1 } },
    { new: true, runValidators: true },
  );

  return result;
};

const createOnlineBooking = async (customerId: string, payload: any) => {
  const { serviceIds, date, startTime, shopId } = payload;
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found');
  }
  // Fetch current date for discount comparison
  const now = new Date();

  // Fetch services with their applicable prices-----------------------
  const servicesWithPrices = await Promise.all(
    serviceIds.map(async (serviceId: string) => {
      const service = await Service.findById(serviceId).select('price');
      if (!service) throw new Error(`Service with ID ${serviceId} not found`);

      // Check for an active discount
      const discount = await Discount.findOne({
        shop: shopId,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
        $or: [{ services: 'all-services' }, { services: service._id }],
      });

      // Calculate discount price if discount applies; otherwise, use original price
      const price = discount
        ? service.price - (service.price * discount.discountPercentage) / 100
        : service.price;

      return { serviceId: service._id, price };
    }),
  );

  const totalPrice = servicesWithPrices.reduce(
    (total, service) => total + service.price,
    0,
  );

  const totalDuration = await calculateTotalServiceTime(serviceIds);

  // Create the start date in local time
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const startDate = new Date(date);
  startDate.setHours(startHours, startMinutes, 0);

  // Create the end date based on total duration
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + totalDuration);

  // Check for conflicting bookings
  const existingBookings = await Booking.find({
    staffId: payload.staffId,
    $and: [
      { startTime: { $lt: endDate }, endTime: { $gt: startDate } }, // Overlapping existing booking
    ],
  });
  //check operation
  if (existingBookings.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'The selected time slot is conflict with other booking. Please choose a different time.3333',
    );
  }

  // Fetch blocked hours for the staff and shop
  const blockHours = await BlockHour.find({
    entityId: payload.staffId,
    entityType: 'Staff',
    day: new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }),
  });

  const businessBlockHour = await BlockHour.find({
    entityId: shopId,
    entityType: 'Shop',
    day: new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }),
  });

  // Check if the selected time is within a blocked hour
  const isBlocked = blockHours.some(
    (bh) =>
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) >= bh.startTime &&
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) < bh.endTime,
  );

  const isBusinessBlocked = businessBlockHour.some(
    (bh) =>
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) >= bh.startTime &&
      startDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }) < bh.endTime,
  );

  if (isBlocked || isBusinessBlocked) {
    throw new Error(
      'The selected time slot is blocked. Please choose a different time.',
    );
  }

  // check if the stripe payment or paypal payment
  if (payload.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE) {
    // Create the booking with total price and service details
    const result = await Booking.create({
      ...payload,
      shopCategoryId: shop.shopCategoryId,
      startTime: startDate,
      endTime: endDate,
      customerId,
      services: servicesWithPrices,
      paymentStatus: ENUM_PAYMENT_STATUS.PENDING,
      totalPrice, // Store the total price in the booking
      totalDuration,
    });

    //=============================

    // console.log('client accoutid', shop.stripAccountId);
    const amount = totalPrice;
    const amountInCents = totalPrice * 100;
    const adminFee = Math.round(totalPrice * 0.05); // 5% of the amount
    if (adminFee >= amount) {
      throw new Error(
        'Admin fee cannot be greater than or equal to the total amount.',
      );
    }
    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: amountInCents * 0.2,
      transfer_data: {
        destination: shop.stripAccountId as string,
      },
      metadata: {
        bookingId: result._id.toString(),
        shopId: shop._id.toString(),
      },

      on_behalf_of: shop.stripAccountId,
    });

    // -------------------------------------

    // update booking
    await Booking.findByIdAndUpdate(result._id, {
      paymentIntentId: paymentIntent.id,
    });
    return paymentIntent.client_secret;
  } else if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    const result = await PaypalService.handlePaypalPayment(totalPrice);

    const createBooking = await Booking.create({
      ...payload,
      shopCategoryId: shop.shopCategoryId,
      startTime: startDate,
      endTime: endDate,
      customerId,
      services: servicesWithPrices,
      paymentStatus: ENUM_PAYMENT_STATUS.PENDING,
      totalPrice, // Store the total price in the booking
      totalDuration,
      orderId: result.orderId,
    });

    return {
      approvalLink: result.approvalUrl,
      orderId: result.orderId,
    };
  }
};

const createBooking = async (customerId: string, payload: any) => {
  let result;
  if (payload.bookingPaymentType === ENUM_BOOKING_PAYMENT.PAY_ON_SHOP) {
    result = await createPayOnShopBooking(customerId, payload);
  } else {
    result = await createOnlineBooking(customerId, payload);
  }

  return result;
};

const getCustomerBookings = async (
  customerId: string,
  query: Record<string, unknown>,
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({ customerId: customerId }),
    query,
  )
    .search(['customerId'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await bookingQuery.countTotal();
  const result = await bookingQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// cancel reschedule request
const createCancelBookingRequest = async (
  userData: JwtPayload,
  bookingId: string,
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  const shop = await Client.findById(booking.shopId).select(
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
      : `${
          customer?.firstName + ' ' + customer?.lastName
        } requesting to cancel the booking`;
  const notificationImage = USER_ROLE.client
    ? `${shop?.shopImages[0]}`
    : `${customer?.profile_image}`;

  const notificationData = {
    title: 'Cancel Request',
    message: notificationMessage,
    image: notificationImage,
    receiver: requestReceiver,
    type: ENUM_NOTIFICATION_TYPE.CANCEL_BOOKING,
    bookingId: booking._id,
  };

  await Notification.create(notificationData);
};

const changeCancelBookingRequestStatus = async (
  userData: JwtPayload,
  notificationId: string,
  status: string,
) => {
  let result;
  if (status === 'accept') {
    result = await acceptCancelBookingRequest(userData, notificationId);
  } else {
    result = await rejectCancelBookingRequest(userData, notificationId);
  }

  return result;
};

const acceptCancelBookingRequest = async (
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

  await Booking.findByIdAndUpdate(booking._id, { status: 'canceled' });
  await Notification.findByIdAndDelete(notificationId);

  const requestReceiver =
    userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;

  // refund -----------------------------------

  // Create the refund
  //TODO: need to handle based on who cancel the booking and when the booking is canceled
  if (USER_ROLE.customer) {
    const refundAmountInCents = booking.totalPrice * 100;
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: refundAmountInCents,
      });

      console.log('Refund successful:', refund);
      return refund;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Refund failed:', error.message);

        if (error instanceof Stripe.Stripe) {
          console.log('Stripe error:', error.message);
        } else {
          console.log('Unexpected error:', error.message);
        }
      } else {
        console.error('Unexpected error type:', error);
      }
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        'Something went wrong when payment occur , please try again or contact with support',
      );
    }
  } else if (USER_ROLE.client) {
    // Create the refund
    //TODO: need to handle based on who cancel the booking and when the booking is canceled
    const refundAmountInCents = booking.totalPrice * 100;
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
        amount: refundAmountInCents,
      });

      console.log('Refund successful:', refund);
      return refund;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Refund failed:', error.message);

        if (error instanceof Stripe.Stripe) {
          console.log('Stripe error:', error.message);
        } else {
          console.log('Unexpected error:', error.message);
        }
      } else {
        console.error('Unexpected error type:', error);
      }
      throw new AppError(
        httpStatus.SERVICE_UNAVAILABLE,
        'Something went wrong when payment occur , please try again or contact with support',
      );
    }
  }

  const notificationMessage =
    userData.role === USER_ROLE.client
      ? `${shop.shopName} accept your cancel request`
      : `${
          customer?.firstName + ' ' + customer?.lastName
        } accept your cancel request`;
  const notificationImage = USER_ROLE.client
    ? `${shop?.shopImages[0]}`
    : `${customer?.profile_image}`;
  const notificationData = {
    title: 'Accept Cancel Request',
    message: notificationMessage,
    image: notificationImage,
    receiver: requestReceiver,
    bookingId: booking._id,
    type: ENUM_NOTIFICATION_TYPE.REJECT_REQUEST,
  };

  await Notification.create(notificationData);
};

const rejectCancelBookingRequest = async (
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

  await Booking.findByIdAndUpdate(booking._id, { status: 'canceled' });

  await Notification.findByIdAndDelete(notificationId);
  const requestReceiver =
    userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;
  const notificationMessage =
    userData.role === USER_ROLE.client
      ? `${shop.shopName} reject your cancel request`
      : `${
          customer?.firstName + ' ' + customer?.lastName
        } reject your cancel request`;
  const notificationImage = USER_ROLE.client
    ? `${shop?.shopImages[0]}`
    : `${customer?.profile_image}`;
  const notificationData = {
    title: 'Reject Cancel Request',
    message: notificationMessage,
    image: notificationImage,
    receiver: requestReceiver,
    bookingId: booking._id,
    type: ENUM_NOTIFICATION_TYPE.REJECT_REQUEST,
  };

  await Notification.create(notificationData);
};

// const getShopBookings = async (
//   shopId: string,
//   query: Record<string, unknown>,
// ) => {
//   console.log("booking id",shopId)
//   const bookingQuery = new QueryBuilder(Booking.find({shopId:shopId}), query)
//     .search(['name'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();
//   const meta = await bookingQuery.countTotal();
//   const result = await bookingQuery.modelQuery;

//   return {
//     meta,
//     result,
//   };
// };

const getShopBookings = async (
  shopId: string,
  query: Record<string, unknown>,
) => {
  if (query.startTime) {
    const startTime = new Date(query.startTime as string);
    // Ensure the time is set to midnight for exact matching
    query.startTime = {
      $gte: new Date(startTime.setHours(0, 0, 0, 0)),
      $lte: new Date(startTime.setHours(23, 59, 59, 999)),
    };
  }
  if (!query.sort) {
    query.sort = 'startTime';
  }

  // Check for service filter in query
  if (query.serviceId) {
    query['services.serviceId'] = query.serviceId; // Match bookings with the selected serviceId
    delete query.serviceId; // Remove serviceId from the query object to avoid duplicate keys
  }
  const bookingQuery = new QueryBuilder(Booking.find({ shopId }), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  // Populate `services.serviceId` with the full service details
  bookingQuery.modelQuery = bookingQuery.modelQuery.populate({
    path: 'services.serviceId',
    model: 'Service',
    select: 'serviceName',
  });
  const meta = await bookingQuery.countTotal(); // Meta info for total count
  const result = await bookingQuery.modelQuery; // Query results

  return {
    meta,
    result,
  };
};

// get pay on shop booking history

const getPayOnShopBookingHistory = async (
  shopId: string,
  query: Record<string, unknown>,
) => {
  const payOnShopBookingQuery = new QueryBuilder(
    Booking.find({
      shopId: shopId,
      bookingPaymentType: ENUM_BOOKING_PAYMENT.PAY_ON_SHOP,
      status: { $ne: 'canceled' },
    }).select('startTime endTime totalPrice services'),
    query,
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  payOnShopBookingQuery.modelQuery = payOnShopBookingQuery.modelQuery.populate({
    path: 'services.serviceId',
    model: 'Service',
    select: 'serviceName price',
  });
  const meta = await payOnShopBookingQuery.countTotal();
  const result = await payOnShopBookingQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const BookingService = {
  createBooking,
  getCustomerBookings,
  createCancelBookingRequest,
  changeCancelBookingRequestStatus,
  getShopBookings,
  getPayOnShopBookingHistory,
};

export default BookingService;
