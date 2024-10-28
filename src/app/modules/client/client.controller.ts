import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ClientServices from './client.services';

const updateClientProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }
  if (files && typeof files === 'object' && 'shop_image' in files) {
    req.body.shopImages = files['shop_image'].map((file) => file.path);
  }

  const result = await ClientServices.updateClientProfile(
    req?.user?.id,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Client profile updated successfully',
    data: result,
  });
});

const getAllClient = catchAsync(async (req, res) => {
  const result = await ClientServices.getAllClientFromDB(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Client retrieved successfully',
    data: result,
  });
});

const ClientController = {
  updateClientProfile,
  getAllClient,
};

export default ClientController;
