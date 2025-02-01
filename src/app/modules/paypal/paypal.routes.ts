import express from 'express';
import PaypalController from './paypal.controller';

const router = express.Router();

router.post(
  '/execute-paypal-payment-for-booking',
  PaypalController.executePaypalPayment,
);

export const paypalRoutes = router;
