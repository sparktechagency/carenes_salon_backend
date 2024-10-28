import { NextFunction, Request, Response, Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';

import auth from '../../middlewares/auth';

import { uploadFile } from '../../helper/fileUploader';
import { USER_ROLE } from '../user/user.constant';
import ClientValidations from './client.validation';
import ClientController from './client.controller';

const router = Router();

router.patch(
  '/update',
  auth(USER_ROLE.client),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ClientValidations.updateClientProfileValidationSchema),
  ClientController.updateClientProfile,
);
router.patch(
  '/update-status/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ClientController.updateClientStatus,
);

router.get(
  '/all-riders',
  auth(USER_ROLE.superAdmin),
  ClientController.getAllClient,
);

export const clientRoutes = router;
