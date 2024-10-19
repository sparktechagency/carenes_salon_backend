import Stripe from 'stripe';
import config from '../../config';
import Cart from '../cart/cart.model';
import { IOrder } from '../order/order.interface';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import orderServices from '../order/order.services';
import Order from '../order/order.model';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

const createPaymentIntentForCustomerOrderWithStripe = async (
  customerId: string,
  payload: IOrder,
) => {
  const cart = await Cart.findOne({ customer: customerId }).populate({
    path: 'shop',
    select: 'storeLocation',
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Items not found for order');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number((cart.totalPrice * 100).toFixed(2)),
    currency: 'usd',
    payment_method_types: ['card'],
  });

  await orderServices.createOrder(customerId, payload, paymentIntent.id);
  return {
    clientSecret: paymentIntent.client_secret,
  };
};

// execute payment for customer
const executePaymentForCustomerWithStripe = async (
  paymentId: string,
  customerId: string,
) => {
  if (!paymentId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Payment id is required');
  }
  const order = await Order.findOne({ paymentId, customer: customerId });
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const updatedOrder = await Order.findOneAndUpdate(
    { paymentId: paymentId, customer: customerId },
    { paymentStatus: 'paid' },
    { new: true, runValidators: true },
  );

  return {
    message: 'Order Confirmed',
    order: updatedOrder,
  };
};

const paymentServices = {
  createPaymentIntentForCustomerOrderWithStripe,
  executePaymentForCustomerWithStripe,
};

export default paymentServices;
