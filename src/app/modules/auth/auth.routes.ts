import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';
import authControllers from './auth.controller';
import { USER_ROLE } from '../user/user.constant';
import authValidations from './auth.validation';

const router = Router();

router.post(
  '/login',
  validateRequest(authValidations.loginValidationSchema),
  authControllers.loginUser,
);
router.post(
  '/change-password',
  auth(USER_ROLE.user, USER_ROLE.rider, USER_ROLE.vendor, USER_ROLE.superAdmin),
  validateRequest(authValidations.changePasswordValidationSchema),
  authControllers.changePassword,
);
router.post(
  '/refresh-token',
  validateRequest(authValidations.refreshTokenValidationSchema),
  authControllers.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(authValidations.forgetPasswordValidationSchema),
  authControllers.forgetPassword,
);
router.post(
  '/reset-password',
  validateRequest(authValidations.resetPasswordValidationSchema),
  authControllers.resetPassword,
);

export const authRoutes = router;
