/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { IClient } from './client.interface';
import Client from './client.model';
import { User } from '../user/user.model';
import { customerSpeed, maxDistanceForShop } from '../../constant';
import ShopBookmark from '../shopBookmak/shop.bookmark.model';
import mongoose from 'mongoose';
import Category from '../category/category.model';
import Service from '../service/service.model';
import getCurrentDay from '../../helper/getCurrentDay';
import BusinessHour from '../bussinessHour/businessHour.model';
import Discount from '../discount/discount.model';
import ShopCategory from '../shopCategory/shopCategory.model';
import Booking from '../booking/booking.model';
import {
  ENUM_NOTIFICATION_TYPE,
  ENUM_PAYMENT_METHOD,
  ENUM_PAYMENT_PURPOSE,
} from '../../utilities/enum';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../../utilities/paypalClient';
import config from '../../config';
import Notification from '../notification/notification.model';
import getAdminNotificationCount from '../../helper/getAdminNotification';
import { getIO } from '../../socket/socketManager';
import PaypalService from '../paypal/paypal.service';
import Transaction from '../transaction/transaction.model';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const updateClientProfile = async (
  userId: string,
  payload: Partial<IClient>,
) => {
  console.log('updateClientProfile', payload);
  const result = await Client.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addShopDetails = async (id: string, payload: Partial<IClient>) => {
  const shop = await Client.findById(id);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const isCategoryExist = await ShopCategory.findOne({
    categoryName: payload.shopCategory,
  });
  if (!isCategoryExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop category not found');
  }

  const result = await Client.findByIdAndUpdate(
    id,
    { ...payload, isShopInfoProvided: true },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

const addBankDetails = async (id: string, payload: Partial<IClient>) => {
  const io = getIO();
  const shop = await await Client.findById(id);

  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const result = await Client.findByIdAndUpdate(
    id,
    { ...payload, isProfileCompleted: true },
    { new: true, runValidators: true },
  );

  const notificationData = {
    title: 'New Shop Register!',
    message: `A new shop is registered named ${shop.shopName}`,
    receiver: 'admin',
  };
  await Notification.create(notificationData);
  const unseenNotificationCount = await getAdminNotificationCount();
  //@ts-ignore
  // TODO: need to send notification
  io.emit('admin-notification', unseenNotificationCount);
  return result;
};
const getAllClientFromDB = async (query: Record<string, any>) => {
  const totalSales = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$shopId',
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  // Create a mapping for quick lookup of total sales by shopId
  const salesMap = totalSales.reduce(
    (acc, sale) => {
      acc[sale._id.toString()] = sale.totalSales;
      return acc;
    },
    {} as Record<string, number>,
  );

  //Build the client query with pagination, search, etc.
  const ClientQuery = new QueryBuilder(
    Client.find().select(
      'shopName shopImages totalRating totalRatingCount phoneNumber email location status city user',
    ),
    query,
  )
    .search(['shopName'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const meta = await ClientQuery.countTotal();
  const clients = await ClientQuery.modelQuery;

  // Add totalSales to each client in the result
  const clientsWithSales = clients.map((client) => {
    const clientId = client._id.toString();
    return {
      ...client.toObject(),
      totalSales: salesMap[clientId] || 0,
    };
  });

  if (query.sort === 'topSelling') {
    clientsWithSales.sort((a, b) => b.totalSales - a.totalSales);
  }

  return {
    meta,
    result: clientsWithSales,
  };
};

const updateClientStatus = async (id: string, status: string) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const session = await Client.startSession();
  session.startTransaction();

  try {
    const result = await Client.findByIdAndUpdate(
      id,
      { status: status },
      { runValidators: true, new: true, session: session },
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
    }

    const isActive = status === 'active';

    await User.findOneAndUpdate(
      { _id: result.user },
      { isActive: isActive },
      { runValidators: true, new: true, session: session },
    );
    //! TODO: need to send notification after saving in database
    const notificationData = {
      title: isActive ? 'Activate shop' : 'Deactivate shop',
      message: isActive
        ? 'Congratulations admin approved your shop.Please connect your bank information for receive payments'
        : 'An Admin deactivate your shop , please contact with support',
      receiver: result._id,
    };
    await Notification.create(notificationData);

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Something went wrong ,try again letter ',
    );
  }
};

// get single shop -----------------------------

const getNearbyShopWithTime = async (
  customerId: string,
  query: Record<string, any>,
) => {
  const matchStage: any[] = [
    ...(query.shopName
      ? [
          {
            $match: {
              shopName: { $regex: query.shopName, $options: 'i' },
            },
          },
        ]
      : []),
    ...(query.shopGenderCategory
      ? [
          {
            $match: {
              shopGenderCategory: query.shopGenderCategory,
            },
          },
        ]
      : []),
  ];

  // Base aggregation pipeline
  const pipeline: any[] = [];

  // Conditionally add $geoNear if nearby is true
  // if (query.latitude && query.longitude) {
  //   pipeline.push({
  //     $geoNear: {
  //       near: {
  //         type: 'Point',
  //         coordinates: [query.longitude, query.latitude],
  //       },
  //       distanceField: 'distance',
  //       maxDistance: maxDistanceForShop,
  //       spherical: true,
  //     },
  //   });
  // }
  if (query.latitude && query.longitude) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [
            parseFloat(query.longitude),
            parseFloat(query.latitude),
          ],
        },
        distanceField: 'distance',
        maxDistance: maxDistanceForShop,
        spherical: true,
      },
    });
  }

  pipeline.push(...matchStage);

  // Add filter for shopCategoryId if provided
  if (query.shopCategoryId) {
    pipeline.push({
      $match: {
        shopCategoryId: new mongoose.Types.ObjectId(query.shopCategoryId),
      },
    });
  }

  // Add estimated time calculation
  pipeline.push({
    $addFields: {
      estimatedTime: {
        $divide: ['$distance', customerSpeed], // distance / speed
      },
    },
  });
  // Conditionally add ratingRatio calculation and sorting if 'topRated' is in query
  if (query.topRated) {
    pipeline.push({
      $addFields: {
        ratingRatio: {
          $cond: {
            if: { $eq: [{ $ifNull: ['$totalRatingCount', 0] }, 0] }, // Prevent division by zero
            then: 0,
            else: { $divide: ['$totalRating', '$totalRatingCount'] }, // totalRating / totalRatingCount
          },
        },
      },
    });

    pipeline.push({
      $sort: {
        ratingRatio: -1,
      },
    });
  }

  // Add projection to select specific fields
  pipeline.push({
    $project: {
      shopName: 1,
      shopCategoryId: 1,
      distance: 1,
      estimatedTime: 1,
      isBookmark: 1,
      shopImages: 1,
      location: 1,
      totalRating: 1,
      totalRatingCount: 1,
      shopGenderCategory: 1,
      address: 1,
    },
  });
  const result = await Client.aggregate(pipeline);

  const bookmarks = await ShopBookmark.find({ customer: customerId }).select(
    'shop',
  );
  const bookmarkedShopIds = new Set(bookmarks.map((b) => b.shop.toString()));

  const enrichedResult = result.map((shop) => ({
    ...shop,
    isBookmark: bookmarkedShopIds.has(shop._id.toString()),
  }));

  return enrichedResult;
};

const getSingleShop = async (id: string) => {
  const currentDay = getCurrentDay();
  const now = new Date();

  // Fetch business hours for the current day
  const businessHour = await BusinessHour.findOne({
    entityId: id,
    day: currentDay,
  }).select('day openTime closeTime isClose');

  // Find the client/shop by ID and populate the shopCategoryId
  const shop = await Client.findById(id)
    .populate('shopCategoryId')
    .select(
      'shopImages shopName location totalRating totalRatingCount _id shopGenderCategory',
    );

  // Check if the shop was found
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  // Fetch categories related to the shop's ID
  const categories = await Category.find({ shop: shop._id })
    .select('categoryName appointmentColor')
    .exec();

  // Check for an active discount
  const discount = await Discount.findOne({
    shop: id,
    discountStartDate: { $lte: now },
    discountEndDate: { $gte: now },
  });

  const isAllServicesDiscounted = discount?.services === 'all-services';
  const categoriesWithServices = await Promise.all(
    categories.map(async (category) => {
      const services = await Service.find({ category: category._id })
        .select('serviceName availableFor durationMinutes price')
        .exec();
      const servicesWithDiscount = services.map((service) => {
        const isServiceDiscounted =
          isAllServicesDiscounted ||
          (discount?.services instanceof Array &&
            discount.services.includes(service._id));

        if (isServiceDiscounted) {
          const discountAmount =
            service.price * (discount.discountPercentage / 100);
          const discountPrice = service.price - discountAmount;
          return {
            ...service.toObject(),
            discountPrice: discountPrice,
          };
        }

        return service.toObject();
      });

      return {
        ...category.toObject(),
        services: servicesWithDiscount,
      };
    }),
  );

  // Format the response as required
  return {
    ...shop.toObject(),
    categories: categoriesWithServices,
    businessHour,
  };
};

const getShopDetails = async (id: string) => {
  const shop = await Client.findById(id);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  return shop;
};

const getPayOnShopData = async (query: Record<string, unknown>) => {
  const shopQuery = new QueryBuilder(
    Client.find().select('shopName payOnShopChargeDueAmount shopImages '),
    query,
  )
    .search(['shopName'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const meta = await shopQuery.countTotal();
  const result = await shopQuery.modelQuery;

  return { meta, result };
};

const payAdminFee = async (profileId: string, payload: any) => {
  let result;
  if (payload?.paymentMethod === 'stripe') {
    result = await payAdminFeeWithStripe(profileId);
  } else if (payload?.paymentMethod === 'paypal') {
    result = await payAdminFeeWithPaypal(profileId);
  }
  return result;
};

// pay admin fee with stripe------------------------------

const payAdminFeeWithStripe = async (shopId: string) => {
  const shop = await Client.findById(shopId).select(
    'payOnShopChargeDueAmount _id',
  );
  const amountInCents = Math.round(shop.payOnShopChargeDueAmount * 100);
  console.log('shop id', shop._id);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Admin fee`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      shopId: shop._id.toString(),
      paymentPurpose: ENUM_PAYMENT_PURPOSE.ADMIN_FEE,
    },
    success_url: `${config.stripe.admin_fee_payment_success_url}`,
    cancel_url: `${config.stripe.payment_cancel_url}`,
  });

  return { url: session.url };
};

const payAdminFeeWithPaypal = async (shopId: string) => {
  const shop = await Client.findById(shopId).select(
    'payOnShopChargeDueAmount _id',
  );
  const amount = shop.payOnShopChargeDueAmount;
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  const returnUrl = config.paypal.paypal_return_url_for_amdin_fee;
  const cancelUrl = config.paypal.paypal_cancel_url_for_admin_fee;

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          value: amount.toFixed(2),
          currency_code: 'EUR',
        },
      },
    ],
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  });

  try {
    const order = await paypalClient.execute(request);
    const orderId = order.result.id;

    await Transaction.create({
      senderEntityId: shopId,
      senderEntityType: 'Client',
      amount: amount,
      type: 'Shop Charge',
      paymentMethod: ENUM_PAYMENT_METHOD.PAYPAL,
      transactionId: orderId,
      status: 'pending',
    });
    const approvalUrl = order.result.links.find(
      (link: { rel: string; href: string }) => link.rel === 'approve',
    )?.href;

    if (approvalUrl) {
      return { url: approvalUrl };
    } else {
      throw new Error('Failed to retrieve approval URL');
    }
  } catch (error) {
    throw new Error('Failed to create PayPal payment');
  }
};

const executeAdminFeeWithPaypalPayment = async (orderId: string) => {
  console.log('orderid', orderId);
  const token = orderId;

  try {
    const orderDetails = await PaypalService.getOrderDetails(token);
    console.log('order details', orderDetails);
    const orderId = orderDetails.id;
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    const captureResponse = await paypalClient.execute(captureRequest);
    console.log('capture response', captureResponse);
    // const captureId = captureResponse?.result?.id;
    if (
      !captureResponse.result.purchase_units[0].payments.captures[0].amount
        .value
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid payment data in capture response.',
      );
    }

    const updateTransaction = await Transaction.findOneAndUpdate(
      { transactionId: orderId },
      { status: 'success' },
      { new: true, runValidators: true },
    );
    if (!updateTransaction) {
      throw new AppError(
        httpStatus.FAILED_DEPENDENCY,
        'Failed to create transaction',
      );
    }
    await Client.findByIdAndUpdate(
      updateTransaction?.senderEntityId,
      {
        $inc: { payOnShopChargeDueAmount: -updateTransaction?.amount },
      },
      { new: true, runValidators: true },
    );

    return {
      captureId: captureResponse.result.id,
    };
  } catch (captureError) {
    throw new Error('Failed to capture payment.');
  }
};

// notify shops for admin fee
const notifyAllShopsForAdminFee = async () => {
  const shops = await Client.find({
    payOnShopChargeDueAmount: { $gt: 100 },
    isDeleted: false,
    status: 'active',
  });

  if (!shops.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Shops not found who have admin fee more then 100 eur',
    );
  }

  const notifications = shops.map((shop) => ({
    title: 'Admin Fee Alert',
    message: `Dear ${shop.shopName}, your current due charge is ${shop.payOnShopChargeDueAmount}. Please clear it to avoid penalties.`,
    seen: false,
    receiver: shop.user.toString(),
    type: ENUM_NOTIFICATION_TYPE.NOTIFY_ADMIN_FEE,
  }));

  await Notification.insertMany(notifications);

  for (const shop of shops) {
    // TODO: need to send notification to all client
    console.log(`Notification sent to shop: ${shop.shopName}`);
  }
};

const notifySingleShopsForAdminFee = async (shopId: string) => {
  const shop = await Client.findById(shopId);
  if (!shop) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }
  const notificationData = {
    title: 'Admin Fee Alert',
    message: `Dear ${shop.shopName}, your current due charge is ${shop.payOnShopChargeDueAmount}. Please clear it to avoid penalties.`,
    seen: false,
    receiver: shop.user.toString(),
    type: ENUM_NOTIFICATION_TYPE.NOTIFY_ADMIN_FEE,
  };

  await Notification.create(notificationData);
  // TODO: need to send notification to client
  console.log(`Notification sent to shop: ${shop.shopName}`);
};

const addPaypalEmail = async (profileId: string, paypalEmail: string) => {
  const client = await Client.findById(profileId);
  if (!client) {
    throw new AppError(httpStatus.NOT_FOUND, 'Client not found');
  }
  const result = await Client.findByIdAndUpdate(
    profileId,
    { paypalEmail: paypalEmail },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteClient = async (id: string) => {
  const client = await Client.findById(id);
  if (!client) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const result = await Client.findByIdAndDelete(id);
  await User.findByIdAndDelete(client.user);
  return result;
};

const ClientServices = {
  updateClientProfile,
  getAllClientFromDB,
  updateClientStatus,
  getNearbyShopWithTime,
  getSingleShop,
  addShopDetails,
  addBankDetails,
  getShopDetails,
  getPayOnShopData,
  payAdminFee,
  notifyAllShopsForAdminFee,
  notifySingleShopsForAdminFee,
  addPaypalEmail,
  deleteClient,
  executeAdminFeeWithPaypalPayment,
};

export default ClientServices;
