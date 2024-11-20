import httpStatus from "http-status";
import catchAsync from "../../utilities/catchasync";
import BookingService from "./booking.services";
import sendResponse from "../../utilities/sendResponse";

const createBooking = catchAsync(async (req, res) => {
    const result = await BookingService.createBooking(req.user.profileId,req.body);
    // const result = await BookingService.createBooking(req.body.profileId,req.body);
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Booking created successfully',
       data: result,
     });
   });

   const getCustomerBookings = catchAsync(async(req,res)=>{
    const result = await BookingService.getCustomerBookings(req.user.profileId,req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Bookings retrieved successfully',
      data: result,
    });
   })
   const createCancelBookingRequest = catchAsync(async(req,res)=>{
    const result = await BookingService.createCancelBookingRequest(req.user,req.body.bookingId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Bookings retrieved successfully',
      data: result,
    });
   })

const BookingController = {
    createBooking,
    getCustomerBookings,
    createCancelBookingRequest
}

export default BookingController;