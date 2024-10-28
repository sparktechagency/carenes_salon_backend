import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';

import { uploadFile } from '../../helper/fileUploader';
import { USER_ROLE } from '../user/user.constant';
import ClientValidations from './client.validation';
import ClientController from './client.controller';

const router = Router();

router.patch(
  '/update-rider-profile',
  auth(USER_ROLE.client),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(ClientValidations.updateClientProfileValidationSchema),
  ClientController.updateClientProfile,
);

router.get(
  '/all-riders',
  auth(USER_ROLE.superAdmin),
  ClientController.getAllClient,
);

export const clientRoutes = router;
