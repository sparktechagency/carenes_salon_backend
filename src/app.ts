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
import stripeServices from './app/modules/stripe/stripe.services';
import paypal from './app/utilities/paypalConfig';
import handleWebhook from './app/socketManager/webhook';
const endpointSecret =
  'whsec_f05875eb42dd8051fbc20bcdb538e22c499ecd114bde7eea65bb0602b1730562';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
// parser---------------------
// app.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     if (!sig || typeof sig !== 'string') {
//       console.error('Missing or invalid Stripe signature');
//       return res
//         .status(400)
//         .send('Webhook Error: Missing or invalid Stripe signature');
//     }

//     let event;

//     try {
//       // Verify webhook signature
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       if (err instanceof Error) {
//         console.error('Webhook signature verification failed:', err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//       } else {
//         console.error('An unknown error occurred during webhook verification');
//         return res.status(400).send('Webhook Error: Unknown error');
//       }
//     }

//     // Handle the different event types
//     switch (event.type) {
//       case 'payment_intent.created':
//         console.log('Payment intent');
//         break;
//       case 'payment_intent.succeeded':
//         // handlePaymentSuccess(event);
//         {
//           console.log('Payment sucess');
//           const paymentIntent = event.data.object;
//           await stripeServices.handlePaymentSuccess(paymentIntent);
//         }
//         break;
//       case 'account.updated':
//         {
//           const account = event.data.object as Stripe.Account;

//           // Check if the account onboarding is complete
//           if (account.details_submitted) {
//             try {
//               // Use the utility function to update the client's status
//               await stripeServices.updateClientStripeConnectionStatus(
//                 account.id,
//               );
//             } catch (err) {
//               console.error(
//                 `Failed to update client status for Stripe account ID: ${account.id}`,
//                 err,
//               );
//             }
//           }
//           break;
//         }
//         break;
//       case 'refund.created':
//         console.log('refund created');
//         break;
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
//     }

//     // Send a 200 response to acknowledge receipt of the event
//     res.json({ received: true });
//   },
// );
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

app.get('/get-account', async (req, res) => {
  const accountStatus = await stripe.accounts.retrieve('acct_1QMnBYEOWpkNPDJD');

  // console.log('Connected Account Details:', account);
  // console.log({
  //   payouts_enabled: accountStatus.payouts_enabled,
  //   charges_enabled: accountStatus.charges_enabled,
  //   requirements: accountStatus.requirements,
  //   default_currency: accountStatus.default_currency,
  //   capabilities: accountStatus.capabilities
  // })
  console.log(accountStatus.capabilities);
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountStatus.id,
  });
  //  console.log('Balance:', {
  //   available: balance.available,
  //   pending: balance.pending,
  //   instant_available: balance.instant_available
  // });
  return 0;
});

const test = (req: Request, res: Response) => {
  Promise.reject();
  // const a = 10;
  // res.send(a);
};

app.get('/', test);

//===============================================================================

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
