import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeError(error: BraintreeError | Error): error is BraintreeError {
    return error.name === 'BraintreeError';
}
