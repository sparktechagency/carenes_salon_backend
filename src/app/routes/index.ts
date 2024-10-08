import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { customerRoutes } from '../modules/customer/customer.routes';
import { vendorRoutes } from '../modules/vendor/vendor.routes';
import { riderRoutes } from '../modules/rider/rider.routes';
import { productRoutes } from '../modules/product/product.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { productBookmarkRoutes } from '../modules/productBookmark/product.bookmark.routes';
import { shopBookmarkRoutes } from '../modules/shopBookmak/product.bookmark.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { orderRoutes } from '../modules/order/order.routes';

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
  {
    path: '/banner',
    router: bannerRoutes,
  },
  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/feedback',
    router: feedbackRoutes,
  },
  {
    path: '/product-bookmark',
    router: productBookmarkRoutes,
  },
  {
    path: '/shop-bookmark',
    router: shopBookmarkRoutes,
  },
  {
    path: '/cart',
    router: cartRoutes,
  },
  {
    path: '/order',
    router: orderRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
