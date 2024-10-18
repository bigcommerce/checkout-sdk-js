import { StripePaymentEvent } from './stripe-upe';

export const isStripePaymentEvent = (event: unknown): event is StripePaymentEvent => {
    return typeof event === 'object' && event !== null && 'value' in event && 'collapsed' in event;
};
