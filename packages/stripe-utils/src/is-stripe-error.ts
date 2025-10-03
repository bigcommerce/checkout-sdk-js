import { StripeError } from './stripe';

export function isStripeError(error: unknown): error is StripeError {
    return typeof error === 'object' && error !== null && 'type' in error;
}
