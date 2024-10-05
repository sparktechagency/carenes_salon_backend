import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import customerValidations from '../customer/customer.validation';
import riderValidations from '../rider/rider.validation';
import { uploadFile } from '../../helper/fileUploader';
import vendorValidations from '../vendor/vendor.validation';

const router = Router();

router.post(
  '/register-customer',
  validateRequest(customerValidations.registerCustomerValidationSchema),
  userControllers.registerCustomer,
);

router.post(
  '/register-rider',
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(riderValidations.registerRiderValidationSchema),
  userControllers.registerRider,
);
router.post(
  '/register-vendor',
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(vendorValidations.registerVendorValidationSchema),
  userControllers.registerVendor,
);

router.post('/register-vendor');

export const userRoutes = router;
