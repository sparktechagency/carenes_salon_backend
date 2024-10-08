// import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import customerValidations from '../customer/customer.validation';
import riderValidations from '../rider/rider.validation';
// import { uploadFile } from '../../helper/fileUploader';
import vendorValidations from '../vendor/vendor.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import { Router } from 'express';

const router = Router();

router.post(
  '/register-customer',
  validateRequest(customerValidations.registerCustomerValidationSchema),
  userControllers.registerCustomer,
);

router.post(
  '/register-rider',
  // uploadFile(),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = JSON.parse(req.body.data);
  //   next();
  // },
  validateRequest(riderValidations.registerRiderValidationSchema),
  userControllers.registerRider,
);
router.post(
  '/register-vendor',
  // uploadFile(),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = JSON.parse(req.body.data);
  //   next();
  // },
  validateRequest(vendorValidations.registerVendorValidationSchema),
  userControllers.registerVendor,
);

router.post('/register-vendor');
router.get(
  '/get-my-profile',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.customer,
    USER_ROLE.rider,
    USER_ROLE.vendor,
  ),
  userControllers.getMyProfile,
);

export const userRoutes = router;
