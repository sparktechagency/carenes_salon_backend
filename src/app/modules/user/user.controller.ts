import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import userServices from './user.services';

const registerCustomer = catchAsync(async (req, res) => {
  const result = await userServices.registerCustomer(
    req?.body?.password,
    req?.body?.customer,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Costumer register successfully',
    data: result,
  });
});

const userController = {
  registerCustomer,
};
export default userController;
