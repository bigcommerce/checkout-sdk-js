import { BraintreeError } from './braintree';

export default function isBraintreeError(error: BraintreeError | Error | unknown): error is BraintreeError {
    return (error as Error).name === 'BraintreeError';
}
