import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { businessRoutes } from '../modules/vendor/business.routes';
import { authRoutes } from '../modules/auth/auth.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
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
