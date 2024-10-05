import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import businessServices from './business.services';
import sendResponse from '../../utilities/sendResponse';

const createBusiness = catchAsync(async (req, res) => {
  const user = req?.user;
  const { files } = req;
  let businessImage;
  if (files && typeof files === 'object' && 'business_image' in files) {
    businessImage = files['business_image'][0].path;
  } else {
    businessImage = null;
  }
  const payload = {
    ...req.body,
    vendor: user?.id,
    business_image: businessImage,
  };
  const result = await businessServices.createBusinessIntoDB(user?.id, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User register successfully',
    data: result,
  });
});

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
const updatedBusiness = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'business_image' in files) {
    req.body.business_image = files['business_image'][0].path;
  }

  const result = await businessServices.updateBusinessIntoDB(
    req?.params?.id,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Business updated successfully',
    data: result,
  });
});

const businessControllers = {
  createBusiness,
  getAllBusiness,
  getSingleBusiness,
  updatedBusiness,
};

export default businessControllers;
