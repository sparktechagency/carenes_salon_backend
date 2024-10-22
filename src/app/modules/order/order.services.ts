/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import Order from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLE } from '../user/user.constant';
import Vendor from '../vendor/vendor.model';
import Rider from '../rider/rider.model';
import { ENUM_ORDER_STATUS } from '../../utilities/enum';
import { JwtPayload } from 'jsonwebtoken';
import Stripe from 'stripe';
import config from '../../config';
import Notification from '../notification/notification.model';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const createOrder = async (
  customerId: string,
  payload: IOrder,
  paymentId?: string,
) => {
  const cart = await Cart.findOne({ customer: customerId }).populate({
    path: 'shop',
    select: 'storeLocation storeName',
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Items not found for order');
  }

  const createNewOrder = await Order.create({
    ...payload,
    shopLocation: cart.shop.storeLocation,
    items: cart?.items,
    customer: customerId,
    shop: cart?.shop,
    shopName: cart.shop.storeName,
    totalPrice: cart.totalPrice,
    totalQuantity: cart.totalQuantity,
    subTotal: cart.subTotal,
    deliveryFee: cart.deliveryFee,
    paymentId,
  });

  await Cart.deleteOne({ customer: customerId });

  return createNewOrder;
};

const getAllOrders = async (query: Record<string, any>) => {
  const orderQuery = new QueryBuilder(
    Order.find()
      .populate({
        path: 'items.product',
        select: 'name price images',
      })
      .populate('customer', 'name email'),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await orderQuery.countTotal();
  const result = await orderQuery.modelQuery;

  return {
    meta,
    result,
  };
};

// get my orders--------------

const getMyOrders = async (user: any, query: Record<string, any>) => {
  if (user.role === USER_ROLE.customer) {
    const orderQuery = new QueryBuilder(
      Order.find({ customer: user?.profileId })
        .populate({
          path: 'items.product',
          select: 'name price images',
        })
        .populate('customer', 'name email'),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await orderQuery.countTotal();
    const result = await orderQuery.modelQuery;

    return {
      meta,
      result,
    };
  } else if (user.role === USER_ROLE.rider) {
    const orderQuery = new QueryBuilder(
      Order.find({ rider: user?.profileId })
        .populate({
          path: 'items.product',
          select: 'name price images',
        })
        .populate('customer', 'name email'),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await orderQuery.countTotal();
    const result = await orderQuery.modelQuery;

    return {
      meta,
      result,
    };
  } else if (user.role === USER_ROLE.vendor) {
    const orderQuery = new QueryBuilder(
      Order.find({ shop: user?.profileId })
        .populate({
          path: 'items.product',
          select: 'name price images',
        })
        .populate('customer', 'name email'),
      query,
    )
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await orderQuery.countTotal();
    const result = await orderQuery.modelQuery;

    return {
      meta,
      result,
    };
  }
};

const getNearbyOrders = async ({
  latitude,
  longitude,
  maxDistance,
}: {
  latitude: number;
  longitude: number;
  maxDistance: number;
}) => {
  if (!latitude || !longitude) {
    throw new AppError(httpStatus.NOT_FOUND, 'Please provide valid location');
  }

  const nearbyOrders = await Order.find({
    shopLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    // storeLocation: {
    //   $geoWithin: {
    //     $centerSphere: [[longitude, latitude], maxDistance / 6378100],
    //   },
    // },
    // status: 'pending',
  });

  return nearbyOrders;
};

// update order status
const updateOrderStatus = async (
  user: JwtPayload,
  orderId: string,
  status: string,
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // make canceled
  if (status === ENUM_ORDER_STATUS.CANCELED && user.role === USER_ROLE.vendor) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentId,
      });

      if (refund.status === 'succeeded') {
        const updateOrder = await Order.findByIdAndUpdate(orderId, {
          status: ENUM_ORDER_STATUS.CANCELED,
        });
        // notification for customer --------
        const notificationData = {
          title: 'Your offer has been rejected',
          message: 'We are sorry .. your offer has been rejected from seller',
          receiver: order?.customer,
        };

        await Notification.create(notificationData);
        return updateOrder;
      } else {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Refund failed');
      }
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to process refund',
      );
    }
  }
  // accept order ------------
  else if (
    status === ENUM_ORDER_STATUS.ACCEPTED &&
    user.role === USER_ROLE.vendor
  ) {
    const updateOrder = await Order.findByIdAndUpdate(orderId, {
      status: ENUM_ORDER_STATUS.ACCEPTED,
    });

    const notificationData = {
      title: 'Your offer has been accepted',
      message: 'Your offer has been accepted by seller',
      receiver: order?.customer,
    };

    await Notification.create(notificationData);

    return updateOrder;
  }
  // picked order
  else if (status === ENUM_ORDER_STATUS.PICKED) {
    const updateOrder = await Order.findByIdAndUpdate(orderId, {
      status: ENUM_ORDER_STATUS.PICKED,
    });
    return updateOrder;
  }
  // delivered order
  else if (
    status === ENUM_ORDER_STATUS.DELIVERED &&
    user.role === USER_ROLE.rider
  ) {
    const updateOrder = await Order.findByIdAndUpdate(orderId, {
      status: ENUM_ORDER_STATUS.DELIVERED,
    });
    return updateOrder;
  }
};

// const completeOrder = async (id: string, customerId: string) => {
//   const order = await Order.findOne({ _id: id, customer: customerId });
//   if (!order) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
//   }

//   // make order is completed
//   await Order.findOneAndUpdate(
//     { _id: id, customer: customerId },
//     { status: ENUM_ORDER_STATUS.COMPLETED },
//   );
//   // update vendor wallet
//   //!TODO: wallet for vendor need change------------
//   await Vendor.findByIdAndUpdate(order.shop, {
//     $inc: { walletAmount: order.subTotal },
//   });
//   // update rider wallet
//   await Rider.findByIdAndUpdate(order.rider, {
//     $inc: { walletAmount: order.deliveryFee },
//   });
// };

const completeOrder = async (id: string, customerId: string) => {
  //TODO: need to check the order status

  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: id,
      customer: customerId,
    }).session(session);
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // make order is completed
    await Order.findOneAndUpdate(
      { _id: id, customer: customerId },
      { status: ENUM_ORDER_STATUS.COMPLETED },
      { session },
    );

    // update vendor wallet
    //!TODO: wallet for vendor need change------------
    await Vendor.findByIdAndUpdate(
      order.shop,
      {
        $inc: { walletAmount: order.subTotal },
      },
      { session },
    );

    // update rider wallet
    await Rider.findByIdAndUpdate(
      order.rider,
      {
        $inc: { walletAmount: order.deliveryFee },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message || 'An error occurred during order completion',
    );
  }
};

const orderServices = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getNearbyOrders,
  updateOrderStatus,
  completeOrder,
};

export default orderServices;
