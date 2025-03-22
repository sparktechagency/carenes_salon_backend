/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();
// for stripe----
import Stripe from 'stripe'; // Import Stripe using ES module syntax
import config from './app/config';
import handleWebhook from './app/handleWebhook/webhook';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
// parser---------------------
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:7585',
      'http://localhost:3000',
      'http://localhost:7586',
      'http://192.168.10.25:7585',
      'http://192.168.10.25:7586',
      'http://10.0.60.38:7585',
      'http://10.0.60.187:5175',
      'http://10.0.60.187:7585',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
// onboarding refresh url
router.get('/stripe/onboarding/refresh', async (req, res, next) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).send('Missing accountId');
    }

    // Generate a new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId as string,
      refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${accountId}`,
      return_url: config.stripe.onboarding_return_url,
      type: 'account_onboarding',
    });

    res.redirect(accountLink.url);
  } catch (error) {
    next(error);
  }
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
