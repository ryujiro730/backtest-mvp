import Stripe from 'stripe';
import { getStripeKey } from './env';

export function getStripe() {
  return new Stripe(getStripeKey(), { apiVersion: '2024-06-20' });
}
