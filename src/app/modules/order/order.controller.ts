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

// complete order

const updateOrderStatus = catchAsync(async (req, res) => {
  const result = await orderServices.updateOrderStatus(
    req?.user,
    req?.params?.id,
    req?.body?.status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Order ${result?.status} successfully`,
    data: result,
  });
});
const completeOrder = catchAsync(async (req, res) => {
  const result = await orderServices.completeOrder(
    req?.params?.id,
    req?.user?.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order completed successfully',
    data: result,
  });
});

const orderController = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getNearbyOrders,
  updateOrderStatus,
  completeOrder,
};

export default orderController;
