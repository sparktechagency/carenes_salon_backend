import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import orderServices from './order.services';

const createOrder = catchAsync(async (req, res) => {
  const result = await orderServices.createOrder(
    req?.user?.profileId,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order processed successfully',
    data: result,
  });
});
const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getAllOrders(req.query);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

// get my orders
const getMyOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getMyOrders(req?.user, req?.query);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});
//
const getNearbyOrders = catchAsync(async (req, res) => {
  const result = await orderServices.getNearbyOrders(req?.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

const orderController = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getNearbyOrders,
};

export default orderController;
