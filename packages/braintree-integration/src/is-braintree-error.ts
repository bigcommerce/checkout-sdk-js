import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeError(
    error: BraintreeError | Error | unknown,
): error is BraintreeError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as BraintreeError).name === 'BraintreeError'
    );
}
