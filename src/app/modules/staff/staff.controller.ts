import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import StaffServices from './staff.services';

const createStaff = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }

  const result = await StaffServices.createStaffIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Staff created successfully',
    data: result,
  });
});
const updateStaff = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }

  const result = await StaffServices.updateStaffIntoDB(req.params.id,req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff updated successfully',
    data: result,
  });
});
// delete staff
const deleteStaff = catchAsync(async (req, res) => {
  const result = await StaffServices.deleteStaffFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Staff deleted successfully',
    data: result,
  });
});

const StaffController = {
  createStaff,
  updateStaff,
  deleteStaff
};

export default StaffController;
