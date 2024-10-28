import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import orderValidations from './order.validation';
import orderController from './order.controller';

const router = express.Router();

router.post(
  '/create-order',
  auth(USER_ROLE.customer),
  validateRequest(orderValidations.createOrderValidationSchema),
  orderController.createOrder,
);
router.get(
  '/all-orders',
  auth(USER_ROLE.superAdmin),
  orderController.getAllOrders,
);
router.get(
  '/my-orders',
  auth(USER_ROLE.customer, USER_ROLE.Client, USER_ROLE.Admin),
  orderController.getMyOrders,
);
router.get(
  '/nearby-orders',
  auth(USER_ROLE.Client),
  validateRequest(orderValidations.getNearbyByOrderValidationSchema),
  orderController.getNearbyOrders,
);
router.patch(
  '/update-order-status/:id',
  auth(
    USER_ROLE.customer,
    USER_ROLE.Client,
    USER_ROLE.Admin,
    USER_ROLE.superAdmin,
  ),
  orderController.updateOrderStatus,
);
router.post(
  '/complete-order/:id',
  auth(USER_ROLE.customer),
  orderController.completeOrder,
);

export const orderRoutes = router;
