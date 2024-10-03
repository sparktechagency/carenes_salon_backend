import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import userServices from './user.services';
import AppError from '../../error/appError';

const registerUser = catchAsync(async (req, res) => {
  const result = await userServices.registerUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User register successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await userServices.loginUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});
const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;
  const result = await userServices.changePasswordIntoDB(
    req.user,
    passwordData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password is updated successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await userServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully',
    data: result,
  });
});
const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await userServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  // const userId = req.body.id;
  const token = req?.headers?.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Your token is invalid');
  }
  const result = await userServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});
const userControllers = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};

export default userControllers;
