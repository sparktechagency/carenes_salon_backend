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

// register Client
const registerClient = catchAsync(async (req, res) => {
  // const { files } = req;
  // let drivingLicence;
  // if (files && typeof files === 'object' && 'licence_image' in files) {
  //   drivingLicence = files['licence_image'][0].path;
  // } else {
  //   drivingLicence = null;
  // }
  // const payload = {
  //   ...req.body,
  //   Client: {
  //     ...req.body.Client,
  //     drivingLicence,
  //   },
  // };

  const result = await userServices.registerClient(
    req?.body?.password,
    req?.body?.client,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Client register successfully',
    data: result,
  });
});

// register Admin
const registerAdmin = catchAsync(async (req, res) => {
  const result = await userServices.registerAdmin(
    req?.body?.password,
    req?.body?.admin,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Client register successfully',
    data: result,
  });
});

// get me
const getMyProfile = catchAsync(async (req, res) => {
  const { phoneNumber, role } = req.user;
  const result = await userServices.getMyProfile(phoneNumber, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully retrieved your data',
    data: result,
  });
});

const verifyCode = catchAsync(async (req, res) => {
  const result = await userServices.verifyCode(
    req?.body?.phoneNumber,
    req?.body?.verifyCode,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully verified your account with phone number',
    data: result,
  });
});
const resendVerifyCode = catchAsync(async (req, res) => {
  const result = await userServices.resendVerifyCode(req?.body?.phoneNumber);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verify code send to your message inbox ',
    data: result,
  });
});

const userController = {
  registerCustomer,
  registerClient,
  registerAdmin,
  getMyProfile,
  verifyCode,
  resendVerifyCode,
};
export default userController;
