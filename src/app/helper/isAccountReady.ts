import Stripe from 'stripe';
import config from '../config';

/* eslint-disable @typescript-eslint/no-explicit-any */
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const isAccountReady = async (accountId: string): Promise<boolean> => {
  try {
    // Retrieve connected account details
    const account = await stripe.accounts.retrieve(accountId);

    const { capabilities, requirements } = account;

    // Check if required capabilities are active
    const isCardPaymentsActive = capabilities?.card_payments === 'active';
    const isTransfersActive = capabilities?.transfers === 'active';

    // Ensure there are no pending requirements
    const currentlyDue = requirements?.currently_due || [];
    const isReady =
      isCardPaymentsActive && isTransfersActive && currentlyDue.length === 0;

    return isReady;
  } catch (error: any) {
    console.error(`Failed to check account ${accountId}:`, error.message);
    return false;
  }
};

export default isAccountReady;
