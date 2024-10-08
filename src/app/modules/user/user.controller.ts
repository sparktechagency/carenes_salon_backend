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

// register rider
const registerRider = catchAsync(async (req, res) => {
  // const { files } = req;
  // let drivingLicence;
  // if (files && typeof files === 'object' && 'licence_image' in files) {
  //   drivingLicence = files['licence_image'][0].path;
  // } else {
  //   drivingLicence = null;
  // }
  // const payload = {
  //   ...req.body,
  //   rider: {
  //     ...req.body.rider,
  //     drivingLicence,
  //   },
  // };

  const result = await userServices.registerRider(
    req?.body?.password,
    req?.body?.rider,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rider register successfully',
    data: result,
  });
});

// register vendor
const registerVendor = catchAsync(async (req, res) => {
  // const { files } = req;
  // let storeLicence;
  // if (files && typeof files === 'object' && 'licence_image' in files) {
  //   storeLicence = files['licence_image'][0].path;
  // } else {
  //   storeLicence = null;
  // }
  // let storeImage;
  // if (files && typeof files === 'object' && 'store_image' in files) {
  //   storeImage = files['store_image'][0].path;
  // } else {
  //   storeImage = null;
  // }
  // const payload = {
  //   ...req.body,
  //   vendor: {
  //     ...req.body.vendor,
  //     storeLicence,
  //     storeImage,
  //   },
  // };

  const result = await userServices.registerVendor(
    req?.body?.password,
    req?.body?.vendor,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rider register successfully',
    data: result,
  });
});

// get me
const getMyProfile = catchAsync(async (req, res) => {
  const { email, role } = req.user;
  const result = await userServices.getMyProfile(email, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully retrieved your data',
    data: result,
  });
});
const userController = {
  registerCustomer,
  registerRider,
  registerVendor,
  getMyProfile,
};
export default userController;
