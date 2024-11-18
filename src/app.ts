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
import createConnectedAccountAndOnboardingLink from './app/helper/connectStripe';
const app: Application = express();
// for stripe 
import Stripe from 'stripe';  // Import Stripe using ES module syntax
import config from './app/config';
const endpointSecret = 'whsec_f05875eb42dd8051fbc20bcdb538e22c499ecd114bde7eea65bb0602b1730562';
const stripe = new Stripe(config.stripe.stripe_secret_key as string); 
// parser
app.post('/webhook',express.raw({type:"application/json"}), (req, res) => {
  console.log("kdfjkdjf")
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("try")
  } catch (err) {
    console.log("catch")
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the different event types
  switch (event.type) {
    case "payment_intent.created":
      console.log("Payment intent");
      break;
    case 'payment_intent.succeeded':
      // handlePaymentSuccess(event);
      console.log("Payment sucess");
      break;
    case 'account.updated':
     console.log("Account updated")
      break;
    case 'refund.created':
     console.log("refund created")
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Send a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post("/connect-stipe",createConnectedAccountAndOnboardingLink);



app.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    // const { amount, currency } = req.body; // Ensure these values are passed from the client.
    const amount = 9000;
    const currency = 'usd'; // Example: 'usd', 'eur', etc.
    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in the smallest currency unit (e.g., cents for USD)
      currency, // Example: 'usd', 'eur', etc.
      payment_method_types: ['card'], // Specifies allowed payment methods
    });

    // Send the Payment Intent client secret to the client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

const test = (req: Request, res: Response) => {
  Promise.reject();
  // const a = 10;
  // res.send(a);
};

app.get('/', test);

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
