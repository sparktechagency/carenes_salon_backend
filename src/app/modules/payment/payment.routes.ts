import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import paymentController from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import paymentValidations from './payment.validation';

const router = express.Router();

router.post(
  '/create-customer-stripe-payment',
  auth(USER_ROLE.customer),
  validateRequest(paymentValidations.createOrderStripPaymentValidationSchema),
  paymentController.createPaymentIntentForCustomerWithStripe,
);
router.post(
  '/execute-customer-stripe-payment',
  auth(USER_ROLE.customer),
  paymentController.executePaymentForCustomerWithStripe,
);

export const paymentRoutes = router;
