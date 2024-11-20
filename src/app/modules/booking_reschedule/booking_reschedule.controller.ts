import httpStatus from "http-status";
import sendResponse from "../../utilities/sendResponse";
import RescheduleRequestServices from "./booking_reschedule.service";
import catchAsync from "../../utilities/catchasync";

const createRescheduleRequest = catchAsync(async (req, res) => {
    // console.log(req.body);
    const result = await RescheduleRequestServices.createRescheduleRequest(req.user,req.body);
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Reschedule request successfully created',
       data: result,
     });
   });



const RescheduleRequestController = {
    createRescheduleRequest
}

export default RescheduleRequestController;