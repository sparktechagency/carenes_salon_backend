import * as paypal from '@paypal/checkout-server-sdk';
import * as payoutsSdk from '@paypal/payouts-sdk';

const payoutsEnvironment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID || '',
  process.env.PAYPAL_CLIENT_SECRET || '',
);

const payoutsClient = new payoutsSdk.core.PayPalHttpClient(payoutsEnvironment);

export default payoutsClient;
