import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import metaController from './meta.controller';

const router = express.Router();
router.get(
  '/get-admin-meta-data',
  auth(USER_ROLE.superAdmin),
  metaController.getAminDashboardMetaData,
);
router.get(
  '/get-Admin-meta-data',
  auth(USER_ROLE.Admin),
  metaController.getAdminDashboardMetaData,
);
router.get(
  '/get-shop-chart-data',
  auth(USER_ROLE.superAdmin),
  metaController.getShopChartData,
);
router.get(
  '/get-income-chart-data',
  auth(USER_ROLE.superAdmin),
  metaController.getAreaChartDataForIncome,
);
router.get(
  '/get-sales-chart-data',
  auth(USER_ROLE.Admin),
  metaController.getAreaChartDataForSales,
);

export const metaRoutes = router;
