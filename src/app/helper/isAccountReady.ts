import Stripe from 'stripe';
import config from '../config';

/* eslint-disable @typescript-eslint/no-explicit-any */
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const isAccountReady = async (accountId: string): Promise<boolean> => {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    const { capabilities } = account;

    const isCardPaymentsActive = capabilities?.card_payments === 'active';
    const isTransfersActive = capabilities?.transfers === 'active';

    const isReady = isCardPaymentsActive && isTransfersActive;

    return isReady;
  } catch (error: any) {
    console.error(`Failed to check account ${accountId}:`, error.message);
    return false;
  }
};

export default isAccountReady;
