import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { businessRoutes } from '../modules/bussiness/business.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    router: userRoutes,
  },
  {
    path: '/business',
    router: businessRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
