import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import staffValidations from './staff.validation';
import StaffController from './staff.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.client),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(staffValidations.createStaffValidationSchema),
  StaffController.createStaff,
);
router.get("/all-staff",auth(USER_ROLE.admin,USER_ROLE.superAdmin),StaffController.getAllStaff);
router.get("/my-staff",auth(USER_ROLE.client),StaffController.getMyStaff);
router.patch(
  '/update/:id',
  auth(USER_ROLE.client),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(staffValidations.updateStaffValidationSchema),
  StaffController.updateStaff,
);

router.delete("/delete/:id",auth(USER_ROLE.client),StaffController.deleteStaff);



export const staffRoutes = router;
