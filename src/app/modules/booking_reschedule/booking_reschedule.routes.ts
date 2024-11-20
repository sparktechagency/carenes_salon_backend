import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import RescheduleRequestController from './booking_reschedule.controller';


const router = express.Router();


router.post("/create",auth(USER_ROLE.client,USER_ROLE.customer),RescheduleRequestController.createRescheduleRequest);



export const rescheduleRequestRoutes = router;