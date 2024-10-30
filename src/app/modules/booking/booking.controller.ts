import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import BookingService from "./booking.services";
import sendResponse from "../../utilities/sendResponse";

const createBooking = catchAsync(async (req, res) => {
    const result = await BookingService.createBooking(req.user.profileId,req.body);
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Booking created successfully',
       data: result,
     });
   });


const BookingController = {
    createBooking
}

export default BookingController;