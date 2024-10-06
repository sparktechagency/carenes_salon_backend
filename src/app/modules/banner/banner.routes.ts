import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import bannerController from './banner.controller';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.post(
  '/create-shop-banner',
  uploadFile(),
  auth(USER_ROLE.vendor),
  bannerController.createShopBanner,
);
router.get(
  '/my-shop-banners',
  auth(USER_ROLE.vendor),
  bannerController.getMyShopBanner,
);
router.delete(
  '/delete-shop-banner/:id',
  auth(USER_ROLE.vendor),
  bannerController.deleteMyShopBanner,
);
export const bannerRoutes = router;
