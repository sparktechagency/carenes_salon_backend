import { USER_ROLE } from '../user/user.constant';
import express from 'express';
import notificationController from './notification.controller';
import auth from '../../middlewares/auth';
import noActiveAuth from '../../middlewares/noActiveAuth';
const router = express.Router();

router.get(
  '/get-all-notification',
  noActiveAuth(
    USER_ROLE.superAdmin,
    USER_ROLE.customer,
    USER_ROLE.client,
    USER_ROLE.admin,
  ),
  notificationController.getAllNotification,
);
router.patch(
  '/see-notification',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.customer,
    USER_ROLE.client,
    USER_ROLE.admin,
  ),
  notificationController.seeNotification,
);

export const notificationRoutes = router;
