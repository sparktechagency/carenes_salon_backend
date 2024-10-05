import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import userValidations from './user.validation';
import userControllers from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import customerValidations from '../customer/customer.validation';

const router = Router();

router.post(
  '/register-customer',
  validateRequest(customerValidations.registerCustomerValidationSchema),
  userControllers.registerCustomer,
);

export const userRoutes = router;
