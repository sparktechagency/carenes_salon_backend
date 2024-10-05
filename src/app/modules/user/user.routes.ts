import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import userValidations from './user.validation';
import userControllers from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = Router();

router.post(
  '/register',
  validateRequest(userValidations.registerUserValidationSchema),
  userControllers.registerUser,
);

router.post(
  '/login',
  validateRequest(userValidations.loginValidationSchema),
  userControllers.loginUser,
);
router.post(
  '/change-password',
  auth(USER_ROLE.user, USER_ROLE.rider, USER_ROLE.vendor, USER_ROLE.superAdmin),
  validateRequest(userValidations.changePasswordValidationSchema),
  userControllers.changePassword,
);
router.post(
  '/refresh-token',
  validateRequest(userValidations.refreshTokenValidationSchema),
  userControllers.refreshToken,
);

router.post(
  '/forget-password',
  validateRequest(userValidations.forgetPasswordValidationSchema),
  userControllers.forgetPassword,
);
router.post(
  '/reset-password',
  validateRequest(userValidations.resetPasswordValidationSchema),
  userControllers.resetPassword,
);

export const userRoutes = router;
