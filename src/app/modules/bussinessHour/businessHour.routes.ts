import express from 'express';
import BusinessHourController from './businessHour.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import businessHourValidations from './businessHour.validation';

const router = express.Router();

router.get('/get-available-dates', BusinessHourController.getAvailableDates);
router.get('/get-available-slots', BusinessHourController.getAvailableSlots);
router.get(
  '/get-business-hour',
  auth(USER_ROLE.client),
  // validateRequest(businessHourValidations.getBusinessHourValidationSchema),
  BusinessHourController.getBusinessHour,
);
router.patch(
  '/update-business-hour/:id',
  auth(USER_ROLE.client),
  validateRequest(businessHourValidations.updateBusinessHourSchema),
  BusinessHourController.updateBusinessHour,
);
export const businessHourRoutes = router;
