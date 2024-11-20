import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import BookingController from './booking.controller';

const router = express.Router();

router.post(
  '/create-booking',
  auth(USER_ROLE.customer),
  BookingController.createBooking,
);
router.get(
  '/get-customer-bookings',
  auth(USER_ROLE.customer),
  BookingController.getCustomerBookings,
);

router.post("/create-cancel-booking-request", auth(USER_ROLE.customer,USER_ROLE.client),BookingController.createCancelBookingRequest);
export const bookingRoutes = router;
