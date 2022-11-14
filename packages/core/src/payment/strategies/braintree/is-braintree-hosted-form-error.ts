import { BraintreeHostedFormError } from './braintree';

export default function isBraintreeHostedFormError(error: unknown): error is BraintreeHostedFormError {
    return typeof error === 'object' && error !== null && 'name' in error;
}
