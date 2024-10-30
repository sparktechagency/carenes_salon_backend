import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import sendResponse from "../../utilities/sendResponse";
import BusinessHourServices from "./businessHour.services";

const getAvailableDates = catchAsync(async (req, res) => {
   const result = await BusinessHourServices.getAvailableDates(req.body.staffId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Available dates retrieved successfully',
      data: result,
    });
  });
const getAvailableSlots = catchAsync(async (req, res) => {
   const result = await BusinessHourServices.getAvailableTimeSlots(req.body.staffId,req.body.date);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Available slots retrieved successfully',
      data: result,
    });
  });
const getBusinessHour = catchAsync(async (req, res) => {
   const result = await BusinessHourServices.getBusinessHour(req.body.entityId,req.body.entityType);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Business hour retrieved successfully',
      data: result,
    });
  });





const BusinessHourController = {
    getAvailableDates,
    getAvailableSlots,
    getBusinessHour
}

export default BusinessHourController;