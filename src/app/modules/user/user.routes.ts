// import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import customerValidations from '../customer/customer.validation';
// import { uploadFile } from '../../helper/fileUploader';

import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import { Router } from 'express';
import userValidations from './user.validation';
import ClientValidations from '../client/client.validation';
import AdminValidations from '../admin/admin.validation';
import authWithoutActive from '../../middlewares/authWithoutActive';

const router = Router();

router.post(
  '/register-customer',
  validateRequest(customerValidations.registerCustomerValidationSchema),
  userControllers.registerCustomer,
);

router.post(
  '/register-client',
  validateRequest(ClientValidations.registerClientValidationSchema),
  userControllers.registerClient,
);
router.post(
  '/create-admin',
  validateRequest(AdminValidations.registerAdminValidationSchema),
  userControllers.registerAdmin,
);

router.post('/register-Admin');
router.get(
  '/get-my-profile',
  authWithoutActive(
    USER_ROLE.superAdmin,
    USER_ROLE.customer,
    USER_ROLE.client,
    USER_ROLE.admin,
  ),
  userControllers.getMyProfile,
);

router.post(
  '/verify-code',
  validateRequest(userValidations.verifyCodeValidationSchema),
  userControllers.verifyCode,
);

router.post(
  '/resend-verify-code',
  validateRequest(userValidations.resendVerifyCodeSchema),
  userControllers.resendVerifyCode,
);

router.patch(
  '/block-unblock/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(userValidations.blockUnblockUserValidationSchema),
  userControllers.blockUnblockUser,
);

export const userRoutes = router;
