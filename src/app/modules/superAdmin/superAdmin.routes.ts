import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import SuperAdminController from './superAdmin.controller';

const router = express.Router();

router.patch(
  '/update-profile',
  auth(USER_ROLE.superAdmin),
  SuperAdminController.updateUserProfile,
);

export const superAdminRoutes = router;
