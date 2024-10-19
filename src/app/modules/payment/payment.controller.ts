import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import paymentServices from './payment.services';

const createPaymentIntentForCustomerWithStripe = catchAsync(
  async (req, res) => {
    const result =
      await paymentServices.createPaymentIntentForCustomerOrderWithStripe(
        req?.user?.profileId,
        req?.body,
      );
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Order create successfully',
      data: result,
    });
  },
);
// execute payment with stripe for customer
const executePaymentForCustomerWithStripe = catchAsync(async (req, res) => {
  const result = await paymentServices.executePaymentForCustomerWithStripe(
    req?.body?.paymentId,
    req?.user?.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order  successful',
    data: result,
  });
});

const paymentController = {
  createPaymentIntentForCustomerWithStripe,
  executePaymentForCustomerWithStripe,
};

export default paymentController;
