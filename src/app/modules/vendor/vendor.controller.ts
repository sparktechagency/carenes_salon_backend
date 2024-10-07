import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import businessServices from './vendor.services';
import sendResponse from '../../utilities/sendResponse';
import vendorServices from './vendor.services';

// get all business
const getAllBusiness = catchAsync(async (req, res) => {
  const result = await businessServices.getAllBusiness(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business retrieved successfully',
    data: result,
  });
});

// get single business
const getSingleBusiness = catchAsync(async (req, res) => {
  const result = await businessServices.getSingleBusinessFromDB(
    req?.params?.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Business retrieved successfully',
    data: result,
  });
});

const updateVendorProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'licence_image' in files) {
    req.body.storeLicence = files['licence_image'][0].path;
  }
  if (files && typeof files === 'object' && 'store_image' in files) {
    req.body.storeImage = files['store_image'][0].path;
  }
  console.log('ddd');
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

const vendorController = {
  getAllBusiness,
  getSingleBusiness,
  updateVendorProfile,
  updateShopStatus,
};

export default vendorController;
