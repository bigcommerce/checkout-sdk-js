import { StandardError } from '../../common/error/errors';

/**
 * This error should be thrown when a payment method experiences some kind of
 * failure (i.e.: its client library returns a rejected promise). And there is
 * no other error type that is more specific than this one.
 */
export default class PaymentMethodFailedError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed because the client library of a payment method has thrown an unexpected error.');

        this.name = 'PaymentMethodFailedError';
        this.type = 'payment_method_client_invalid';
    }
}
