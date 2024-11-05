import { StripeError } from './stripe-upe';

export function isStripeError(error: unknown): error is StripeError {
    return typeof error === 'object' && error !== null && 'type' in error;
}
