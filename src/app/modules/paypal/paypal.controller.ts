import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PaypalService from './paypal.service';

const executePaypalPayment = catchAsync(async (req, res) => {
  const result = await PaypalService.capturePaymentForAppointment(
    req.body.orderId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment successfull for booking',
    data: result,
  });
});

const PaypalController = {
  executePaypalPayment,
};

export default PaypalController;
