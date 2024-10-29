import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { customerRoutes } from '../modules/customer/customer.routes';
import { productRoutes } from '../modules/product/product.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';
import { productBookmarkRoutes } from '../modules/productBookmark/product.bookmark.routes';
import { shopBookmarkRoutes } from '../modules/shopBookmak/product.bookmark.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { orderRoutes } from '../modules/order/order.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { paymentRoutes } from '../modules/payment/payment.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { clientRoutes } from '../modules/client/client.routes';
import { shopCategoryRoutes } from '../modules/shopCategory/shopCategory.routes';
import { staffRoutes } from '../modules/staff/staff.routes';

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
    path: '/admin',
    router: AdminRoutes,
  },
  {
    path: '/client',
    router: clientRoutes,
  },
  {
    path: '/staff',
    router: staffRoutes,
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
  {
    path: '/meta',
    router: metaRoutes,
  },
  {
    path: '/payment',
    router: paymentRoutes,
  },
  {
    path: '/shop-category',
    router: shopCategoryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
