import { BraintreeError } from './braintree';

export default function isBraintreeError(error: unknown): error is BraintreeError {
    return (error as BraintreeError).name === 'BraintreeError';
}
