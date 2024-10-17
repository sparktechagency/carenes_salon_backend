import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import vendorServices from './vendor.services';

const updateVendorProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'licence_image' in files) {
    req.body.storeLicence = files['licence_image'][0].path;
  }
  if (files && typeof files === 'object' && 'store_image' in files) {
    req.body.storeImage = files['store_image'][0].path;
  }
  const result = await vendorServices.updateVendorProfile(
    req?.user?.id,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor profile updated successfully',
    data: result,
  });
});

// update shop status
const updateShopStatus = catchAsync(async (req, res) => {
  const result = await vendorServices.updateShopStatus(
    req?.params?.id,
    req?.body?.status,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop status updated successfully',
    data: result,
  });
});
const getAllVendor = catchAsync(async (req, res) => {
  const result = await vendorServices.getAllVendorFromDB(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor retrieved successfully',
    data: result,
  });
});

const getNearbyShop = catchAsync(async (req, res) => {
  const result = await vendorServices.getNearbyShopWithTime(
    req?.user?.profileId,
    req?.body,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor retrieved successfully',
    data: result,
  });
});
const addRating = catchAsync(async (req, res) => {
  const result = await vendorServices.addRating(
    req?.params?.shopId,
    req?.body?.rating,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rating added successfully',
    data: result,
  });
});

const vendorController = {
  updateVendorProfile,
  updateShopStatus,
  getAllVendor,
  getNearbyShop,
  addRating,
};

export default vendorController;
