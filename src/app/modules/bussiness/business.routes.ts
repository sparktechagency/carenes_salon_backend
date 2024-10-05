import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import businessValidationSchema from './bussiness.validation';
import businessControllers from './business.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';

const router = Router();

router.post(
  '/create-business',
  auth(USER_ROLE.vendor),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(businessValidationSchema.createBusinessValidationSchema),
  businessControllers.createBusiness,
);

router.patch(
  '/update-business/:id',
  auth(USER_ROLE.vendor),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(businessValidationSchema.updateBusinessValidationSchema),
  businessControllers.updatedBusiness,
);

router.get('/get-all-business', businessControllers.getAllBusiness);
router.get('/get-single-business/:id', businessControllers.getSingleBusiness);

export const businessRoutes = router;
