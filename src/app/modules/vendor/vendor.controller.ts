import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import businessServices from './vendor.services';
import sendResponse from '../../utilities/sendResponse';

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

const businessControllers = {
  getAllBusiness,
  getSingleBusiness,
};

export default businessControllers;
