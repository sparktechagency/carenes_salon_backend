/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import Order from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLE } from '../user/user.constant';
import Vendor from '../vendor/vendor.model';

const createOrder = async (customerId: string, payload: IOrder) => {
  const cart = await Cart.findOne({ customer: customerId }).populate({
    path: 'shop',
    select: 'storeLocation',
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Items not found for order');
  }

  const createNewOrder = await Order.create({
    ...payload,
    items: cart?.items,
    customer: customerId,
    shop: cart?.shop,
    totalPrice: cart.totalPrice,
    totalQuantity: cart.totalQuantity,
    subTotal: cart.subTotal,
    deliveryFee: cart.deliveryFee,
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

// get my orders

const getMyOrders = async (user: any, query: Record<string, any>) => {
  if (user.role === USER_ROLE.customer) {
    const orderQuery = new QueryBuilder(
      Order.find({ customer: user?.profileId })
        .populate({
          path: 'items.product',
          select: 'name price images',
        })
        .populate('customer', 'name email')
        .populate({ path: 'shop', select: 'storeLocation' }),
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

  const nearbyVendors = await Vendor.find({
    storeLocation: {
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
  }).select('_id');

  const vendorIds = nearbyVendors.map((vendor) => vendor._id);
  const orders = await Order.find({ shop: { $in: vendorIds } })
    .populate({
      path: 'items.product',
      select: 'name price images',
    })
    .populate('customer', 'name email')
    .populate({ path: 'shop', select: 'storeLocation' });

  return orders;
};

const orderServices = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getNearbyOrders,
};

export default orderServices;
