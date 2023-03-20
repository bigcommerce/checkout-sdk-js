import { BraintreeError } from './braintree';

export default function isBraintreeError(error: unknown): error is BraintreeError {
    return Boolean(
        typeof error === 'object' &&
            error !== null &&
            ('type' in error || 'message' in error || 'code' in error),
    );
}
