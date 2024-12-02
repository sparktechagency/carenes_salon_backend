import * as paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  client_id: process.env.PAYPAL_CLIENT_ID || '', // Replace with your PayPal Client ID
  client_secret: process.env.PAYPAL_CLIENT_SECRET || '', // Replace with your PayPal Client Secret
});

export default paypal;
