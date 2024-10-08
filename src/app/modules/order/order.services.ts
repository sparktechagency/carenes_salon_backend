/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import Cart from '../cart/cart.model';
import { IOrder } from './order.interface';
import Order from './order.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createOrder = async (customerId: string, payload: IOrder) => {
  const cart = await Cart.findOne({ customer: customerId });

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

  // Clear the customer's cart
  await Cart.deleteOne({ customer: customerId });

  return createNewOrder;
};

const getAllOrders = async (query: Record<string, any>) => {
  //   const orders = await Order.find()
  //     .populate({
  //       path: 'items.product',
  //       select: 'name price images',
  //     })
  //     .populate('customer', 'name email')
  //     .exec();

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

const orderServices = {
  createOrder,
  getAllOrders,
};

export default orderServices;
