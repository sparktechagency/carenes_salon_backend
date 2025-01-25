/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import AppError from '../../error/appError';
import calculateTotalServiceTime from '../../helper/calculateTotalServiceTime';
import BlockHour from '../blockHour/blockHour.model';
import Discount from '../discount/discount.model';
import Service from '../service/service.model';
import Booking from './booking.model';
import cron from 'node-cron';

import {
  ENUM_BOOKING_PAYMENT,
  ENUM_BOOKING_STATUS,
  ENUM_NOTIFICATION_TYPE,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
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
import mongoose from 'mongoose';
import isAccountReady from '../../helper/isAccountReady';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const createPayOnShopBooking = async (customerId: string, payload: any) => {
  const { serviceIds, date, startTime, shopId } = payload;
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found');
  }

  const now = new Date();
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

      // Calculate discount price if discount applies
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
    $and: [{ startTime: { $lt: endDate }, endTime: { $gt: startDate } }],
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

  const result = await Booking.create({
    ...payload,
    shopCategoryId: shop.shopCategoryId,
    startTime: startDate,
    endTime: endDate,
    customerId,
    services: servicesWithPrices,
    paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP,
    totalPrice,
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
  console.log('payload', payload);
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Shop not found');
  }

  if (payload.paymentMethod === 'stripe' && !shop?.stripAccountId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This shop not add payment method please try again letter or make appointment in other shop',
    );
  }
  const accountReady = await isAccountReady(shop.stripAccountId);
  if (payload.paymentMethod === 'stripe' && !accountReady) {
    throw new AppError(
      httpStatus.NON_AUTHORITATIVE_INFORMATION,
      "Shop owner doesn't provide payment info , contact with shop owner",
    );
  }
  if (payload.paymentMethod === 'paypal' && !shop?.paypalEmail) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This shop not add payment method please try again letter or make appointment in other shop',
    );
  }

  const now = new Date();

  // Fetch services with their applicable prices-----------------------
  const servicesWithPrices = await Promise.all(
    serviceIds.map(async (serviceId: string) => {
      const service = await Service.findById(serviceId).select('price');
      if (!service) throw new Error(`Service with ID ${serviceId} not found`);

      // Check for an active discount------
      const discount = await Discount.findOne({
        shop: shopId,
        discountStartDate: { $lte: now },
        discountEndDate: { $gte: now },
        $or: [{ services: 'all-services' }, { services: service._id }],
      });

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
  console.log('start', startDate, 'end', endDate);
  // Check for conflicting bookings----------------
  const existingBookings = await Booking.find({
    staffId: payload.staffId,
    $and: [{ startTime: { $lt: endDate }, endTime: { $gt: startDate } }],
    status: 'booked',
  });
  console.log('existing booking', existingBookings);
  //check operation-------------
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

    const amount = totalPrice;
    const amountInCents = totalPrice * 100;
    const adminFee = Math.round(totalPrice * 0.05); // 5% of the amount
    if (adminFee >= amount) {
      throw new Error(
        'Admin fee cannot be greater than or equal to the total amount.',
      );
    }

    // Create the payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amountInCents,
    //   currency: 'eur',
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    //   application_fee_amount: amountInCents * 0.2,
    //   transfer_data: {
    //     destination: shop?.stripAccountId as string,
    //   },
    //   metadata: {
    //     bookingId: result?._id.toString(),
    //     shopId: shop?._id.toString(),
    //   },

    //   on_behalf_of: shop?.stripAccountId,
    // });

    // -------------------------------------

    // update booking--------------
    // await Booking.findByIdAndUpdate(result._id, {
    //   paymentIntentId: paymentIntent.id,
    // });
    // return paymentIntent.client_secret;

    // with session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Salon Appointment`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: result._id.toString(),
        paymentPurpose: ENUM_PAYMENT_PURPOSE.BOOKING,
      },
      success_url: `${config.stripe.booking_payment_success_url}`,
      cancel_url: `${config.stripe.payment_cancel_url}`,
    });

    // console.log('return url', session.url);
    return { url: session.url };
  } else if (payload.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL) {
    const result = await PaypalService.handlePaypalPayment(totalPrice);

    await Booking.create({
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
    console.log('okey');
    result = await createOnlineBooking(customerId, payload);
  }
  console.log('result', result);
  return result;
};

const getCustomerBookings = async (
  customerId: string,
  query: Record<string, unknown>,
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({
      customerId: customerId,
      status: { $ne: 'canceled' },
    }).populate({ path: 'shopId', select: 'shopName shopImages location' }),
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

// get single booking
const getSingleBooking = async (id: string) => {
  const result = await Booking.findById(id)
    .populate({
      path: 'shopId',
      select: 'shopImages shopName location',
    })
    .populate({
      path: 'services.serviceId',
      select: 'serviceName price durationMinutes',
    })
    .populate({
      path: 'customerId',
      select: 'firstName lastName profile_image',
    })
    .populate({ path: 'staffId', select: 'name appointmentColor' });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  return result;
};

// cancel reschedule request
const createCancelBookingRequest = async (
  userData: JwtPayload,
  bookingId: string,
) => {
  let booking;
  if (userData.role === USER_ROLE.client) {
    booking = await Booking.findOne({
      _id: bookingId,
      shopId: userData?.profileId,
      status: ENUM_BOOKING_STATUS.BOOKED,
      $or: [
        { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
        { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP },
      ],
    });
  } else if (userData?.role === USER_ROLE.customer) {
    booking = await Booking.findOne({
      _id: bookingId,
      customerId: userData?.profileId,
      status: ENUM_BOOKING_STATUS.BOOKED,
      $or: [
        { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
        { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP },
      ],
    });
  }
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  // Get the current time and booking start time
  const currentTime = new Date();
  const startTime = new Date(booking.startTime);

  // Calculate the difference in hours
  const timeDifferenceInMs = startTime.getTime() - currentTime.getTime();
  const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);

  if (timeDifferenceInHours < 2) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can only send a cancellation request at least 2 hours before the booking start time.',
    );
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
    'shopName shopImages stripAccountId',
  );

  const customer = await Customer.findById(booking.customerId).select(
    'firstName lastName profile_image',
  );

  // await Booking.findByIdAndUpdate(booking._id, { status: 'canceled' });
  // await Notification.findByIdAndDelete(notificationId);

  const requestReceiver =
    userData.role === USER_ROLE.client ? booking.customerId : booking.shopId;

  // refund -----------------------------------
  //TODO: need to handle based on who cancel the booking and when the booking is canceled
  if (userData?.role === USER_ROLE.customer) {
    // for stripe payment -----------------------------------
    if (booking?.paymentMethod === 'stripe') {
      const refundAmountInCents = booking.totalPrice * 100;
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          amount: refundAmountInCents,
        });

        await Booking.findByIdAndUpdate(booking._id, { status: 'canceled' });
        await Notification.findByIdAndDelete(notificationId);
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
    } else if (booking?.paymentMethod === 'paypal') {
      const refund = await PaypalService.refundPayment({
        captureId: booking?.orderId,
      });
      console.log('refund:', refund);
    }
  } else if (userData?.role === USER_ROLE.client) {
    const currentTime = notification?.createdAt;
    const startTime = new Date(booking.startTime);

    const timeDifferenceInMs = startTime.getTime() - currentTime.getTime();
    const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);
    let refundPercentage = 50;
    if (timeDifferenceInHours >= 24) {
      refundPercentage = 100;
    }
    // for stripe payment-----------------
    if (booking?.paymentMethod === 'stripe') {
      // const refundAmountInCents = booking.totalPrice * refundPercentage;
      const refundAmountInCents = Math.round(
        booking.totalPrice * refundPercentage,
      );

      // those are previous work
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   booking?.paymentIntentId,
      //   { expand: ['charges'] },
      // );
      // // Retrieve the charge
      // const charge = await stripe.charges.retrieve(
      //   paymentIntent.latest_charge as any,
      // );
      // const applicationFeeId = charge.application_fee;
      // // Extract the application fee ID and charge ID
      // const chargeId = charge?.id;

      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
          amount: refundAmountInCents,
        });
        console.log('refund is =-----------', refund);
        if (refundPercentage == 50) {
          const transferAmountInCent = booking.totalPrice * refundPercentage;
          try {
            // Transfer funds
            console.log('start tranfer');
            const transfer: any = await stripe.transfers.create({
              amount: transferAmountInCent,
              currency: 'eur',
              destination: shop.stripAccountId as string,
            });
            console.log('transfer', transfer);
            console.log('start payouts');
            // Payout to bank
            console.log('nice to pyaout');
            const payout = await stripe.payouts.create(
              {
                amount: transferAmountInCent,
                currency: 'eur',
              },
              {
                stripeAccount: shop.stripAccountId as string,
              },
            );
            console.log('payout', payout);

            await Booking.findByIdAndUpdate(booking._id, {
              status: 'canceled',
            });
            await Notification.findByIdAndDelete(notificationId);
          } catch (error) {
            console.error('Error during transfer or payout:', error);
            throw error;
          }
        }
        // this is previous work ---------
        // if (applicationFeeId && chargeId) {
        //   await stripe.refunds.create({
        //     charge: chargeId,
        //     amount: Math.min(refundAmountInCents, charge.amount),
        //   });
        // }
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
    } else if (booking?.paymentMethod === 'paypal') {
      const refund = await PaypalService.refundPayment({
        captureId: booking?.orderId,
      });
      console.log('refund:', refund);
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
  // if (query.serviceId) {
  //   query['services.serviceId'] = query.serviceId;
  //   delete query.serviceId;
  // }
  // if (query.staffId) {
  //   query['staffId'] = query.staffId;
  // }
  const bookingQuery = new QueryBuilder(
    Booking.find({ shopId, status: { $ne: 'canceled' } })
      .populate({
        path: 'staffId',
        select: 'name appointmentColor',
      })
      .populate({ path: 'shopId', select: 'shopName' }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  // Populate `services.serviceId` with the full service details
  bookingQuery.modelQuery = bookingQuery.modelQuery.populate({
    path: 'services.serviceId',
    model: 'Service',
    select: 'serviceName durationMinutes price',
  });
  const meta = await bookingQuery.countTotal();
  const result = await bookingQuery.modelQuery;

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

const getSalesAndServiceData = async (
  shopId: string,
  query: Record<string, unknown>,
) => {
  //!TODO: need to make changes
  const matchQuery: any = {
    shopId: new mongoose.Types.ObjectId(shopId),
    $or: [
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS, status: 'booked' },
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS, status: 'completed' },
      { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP, status: 'booked' },
      { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP, status: 'completed' },
    ],
  };

  if (query.staffId) {
    matchQuery.staffId = new mongoose.Types.ObjectId(query.staffId as string);
  }

  const currentDate = new Date();
  let dateFilter: any = {};

  if (query.timeRange === 'today') {
    // Get the start and end of today
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    dateFilter = { startTime: { $gte: startOfDay, $lte: endOfDay } };
  } else if (query.timeRange === 'last-month') {
    const startOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    dateFilter = {
      startTime: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    };
  } else if (query.timeRange === 'last-year') {
    // Get the first and last date of the current year (this year, not the last year)
    const startOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfCurrentYear = new Date(currentDate.getFullYear(), 11, 31);
    dateFilter = {
      startTime: { $gte: startOfCurrentYear, $lte: endOfCurrentYear },
    };
  }

  if (Object.keys(dateFilter).length > 0) {
    matchQuery.startTime = dateFilter.startTime;
  }

  // const result = await Booking.aggregate([
  //   {
  //     $match: matchQuery,
  //   },
  //   {
  //     $facet: {
  //       totalSales: [
  //         {
  //           $group: {
  //             _id: null,
  //             totalSales: { $sum: '$totalPrice' },
  //           },
  //         },
  //       ],
  //       serviceDetails: [
  //         {
  //           $unwind: '$services',
  //         },
  //         {
  //           $group: {
  //             _id: '$services.serviceId',
  //             serviceCount: { $sum: 1 },
  //             totalSales: { $sum: '$services.price' },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'services',
  //             localField: '_id',
  //             foreignField: '_id',
  //             as: 'serviceDetails',
  //           },
  //         },
  //         {
  //           $unwind: '$serviceDetails',
  //         },
  //         {
  //           $project: {
  //             serviceName: '$serviceDetails.name',
  //             serviceCount: 1,
  //             totalSales: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $unwind: '$totalSales',
  //   },
  // ]);

  const result = await Booking.aggregate([
    {
      $match: matchQuery,
    },
    {
      $facet: {
        totalSales: [
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalPrice' },
            },
          },
        ],
        serviceDetails: [
          {
            $unwind: '$services',
          },
          {
            $group: {
              _id: '$services.serviceId', // Group by serviceId
              serviceCount: { $sum: 1 },
              totalSales: { $sum: '$services.price' },
            },
          },
          {
            $lookup: {
              from: 'services',
              localField: '_id', // serviceId in Booking
              foreignField: '_id', // _id in services
              as: 'serviceDetails',
            },
          },
          {
            $unwind: '$serviceDetails', // Convert array to object
          },
          {
            $project: {
              serviceName: '$serviceDetails.serviceName',
              serviceCount: 1,
              totalSales: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$totalSales',
    },
  ]);
  const totalSales = result[0]?.totalSales?.totalSales || 0;
  const serviceDetails = result[0]?.serviceDetails || [];

  return {
    totalSales,
    serviceDetails,
  };
};

const markNoShow = async (shopId: string, id: string) => {
  const currentTime = new Date();
  const booking = await Booking.findOne({
    _id: id,
    shopId: shopId,
    endTime: { $lt: currentTime },
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  const result = await Booking.findByIdAndUpdate(
    id,
    { status: 'completed' },
    { new: true, runValidators: true },
  );

  return result;
};

// const getSingleBooking = async (id: string) => {
//   const booking = await Booking.findById(id).populate('services.serviceId');
//   if (!booking) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
//   }
//   return booking;
// };

const markAsComplete = async (bookingId: string) => {
  let result;
  const booking = await Booking.findOne({
    _id: bookingId,
    status: ENUM_BOOKING_STATUS.BOOKED,
    $or: [
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
      { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP },
    ],
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  if (
    booking.bookingPaymentType === 'online' &&
    booking.paymentMethod === ENUM_PAYMENT_METHOD.STRIPE
  ) {
    result = await completeStripeBooking(bookingId);
  } else if (
    booking.bookingPaymentType === 'online' &&
    booking.paymentMethod === ENUM_PAYMENT_METHOD.PAYPAL
  ) {
    result = await completePaypalBooking(bookingId);
  } else if (booking.bookingPaymentType === 'pay-on-shop') {
    result = await completePayOnShopBooking(bookingId);
  }
  return result;
};

const completePayOnShopBooking = async (bookingId: string) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    status: ENUM_BOOKING_STATUS.BOOKED,
    $or: [
      { paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS },
      { paymentStatus: ENUM_PAYMENT_STATUS.PAY_ON_SHOP },
    ],
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  const result = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: ENUM_BOOKING_STATUS.COMPLETED,
    },
    { new: true, runValidators: true },
  );
  return result;
};

const completeStripeBooking = async (bookingId: string) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    status: ENUM_BOOKING_STATUS.BOOKED,
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  // Compare current datetime with startTime
  const currentDateTime = new Date();
  if (currentDateTime < booking.startTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot complete booking before start time',
    );
  }
  const shop = await Client.findById(booking?.shopId);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  const bookingAmount = booking.totalPrice;
  const adminFee = bookingAmount * 0.05;
  const amountInCent = (bookingAmount - adminFee) * 100;
  try {
    // Transfer funds
    const transfer: any = await stripe.transfers.create({
      amount: amountInCent,
      currency: 'eur',
      destination: shop.stripAccountId as string,
    });
    console.log('transfer', transfer);

    // Payout to bank
    console.log('nice to pyaout');
    const payout = await stripe.payouts.create(
      {
        amount: amountInCent,
        currency: 'eur',
      },
      {
        stripeAccount: shop.stripAccountId as string,
      },
    );
    console.log('payout', payout);

    // Update booking data
    await Booking.findByIdAndUpdate(
      bookingId,
      { status: ENUM_BOOKING_STATUS.COMPLETED },
      { new: true, runValidators: true },
    );
  } catch (error) {
    console.error('Error during transfer or payout:', error);
    throw error;
  }
};

const completePaypalBooking = async (bookingId: string) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    status: ENUM_BOOKING_STATUS.BOOKED,
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  // Compare current datetime with startTime
  const currentDateTime = new Date();
  if (currentDateTime < booking.startTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot complete booking before start time',
    );
  }
  const shop = await Client.findById(booking?.shopId);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  const bookingAmount = booking.totalPrice;
  const adminFee = bookingAmount * 0.05;
  const shopAmount = bookingAmount - adminFee;
  const result = await PaypalService.transferMoneyToSalonOwner(
    shopAmount,
    shop.paypalEmail,
  );
  return result;
};

// crone job-----------------------------------
cron.schedule('*/10 * * * *', async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await Booking.deleteMany({
      status: 'pending',
      createdAt: { $lte: fiveMinutesAgo },
    });
    console.log(`Deleted ${result.deletedCount} pending bookings`);
  } catch (error) {
    console.error('Error running cron job:', error);
  }
});

const BookingService = {
  createBooking,
  getCustomerBookings,
  createCancelBookingRequest,
  changeCancelBookingRequestStatus,
  getShopBookings,
  getPayOnShopBookingHistory,
  getSalesAndServiceData,
  markNoShow,
  getSingleBooking,
  markAsComplete,
};

export default BookingService;
