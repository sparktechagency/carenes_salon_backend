
import express from "express"
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import BookingController from "./booking.controller";


const router  = express.Router();


router.post("/create-booking",auth(USER_ROLE.customer),BookingController.createBooking);

export const bookingRoutes = router;