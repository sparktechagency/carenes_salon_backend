import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';

import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import riderController from './rider.controller';
import riderValidations from './rider.validation';

const router = Router();

router.patch(
  '/update-rider-profile',
  auth(USER_ROLE.rider),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(riderValidations.updateRiderProfileValidationSchema),
  riderController.updateRiderProfile,
);

export const riderRoutes = router;
