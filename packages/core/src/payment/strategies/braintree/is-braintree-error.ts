import { BraintreeError } from './braintree';

export default function isBraintreeError(error: BraintreeError | Error): error is BraintreeError {
    return error.name === 'BraintreeError';
}
