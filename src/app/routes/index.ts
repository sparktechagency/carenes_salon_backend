import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { customerRoutes } from '../modules/customer/customer.routes';
import { vendorRoutes } from '../modules/vendor/vendor.routes';
import { riderRoutes } from '../modules/rider/rider.routes';
import { productRoutes } from '../modules/product/product.routes';
import { categoryRoutes } from '../modules/category/category.routes';

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
    path: '/customer',
    router: customerRoutes,
  },
  {
    path: '/vendor',
    router: vendorRoutes,
  },
  {
    path: '/rider',
    router: riderRoutes,
  },
  {
    path: '/product',
    router: productRoutes,
  },
  {
    path: '/category',
    router: categoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
