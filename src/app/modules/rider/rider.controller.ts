import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import riderServices from './rider.services';

const updateRiderProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'licence_image' in files) {
    req.body.drivingLicence = files['licence_image'][0].path;
  }
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }

  const result = await riderServices.updateRiderProfile(
    req?.user?.id,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rider profile updated successfully',
    data: result,
  });
});

const getAllRider = catchAsync(async (req, res) => {
  const result = await riderServices.getAllRiderFromDB(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rider retrieved successfully',
    data: result,
  });
});

const riderController = {
  updateRiderProfile,
  getAllRider,
};

export default riderController;
