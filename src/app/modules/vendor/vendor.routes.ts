import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import vendorController from './vendor.controller';
import vendorValidations from './vendor.validation';

const router = Router();

router.patch(
  '/update-vendor-profile',
  auth(USER_ROLE.vendor),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(vendorValidations.updateVendorProfileValidationSchema),
  vendorController.updateVendorProfile,
);

router.patch(
  '/update-vendor-status/:id',
  auth(USER_ROLE.superAdmin),
  vendorController.updateShopStatus,
);

router.get(
  '/get-nearby-shop',
  auth(USER_ROLE.customer),
  validateRequest(vendorValidations.getNearbyShopValidationSchema),
  vendorController.getNearbyShop,
);

router.get(
  '/all-vendors',
  auth(USER_ROLE.superAdmin),
  vendorController.getAllVendor,
);

router.patch(
  '/add-rating/:shopId',
  auth(USER_ROLE.customer),
  validateRequest(vendorValidations.addRatingValidationSchema),
  vendorController.addRating,
);

export const vendorRoutes = router;
