import { StandardError } from '../../common/error/errors';

/**
 * This error should be thrown when the client library of a payment method fails
 * to load, or for some reason, it is inaccessible.
 */
export default class PaymentMethodClientUnavailableError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to proceed because the client library of a payment method is not loaded or ready to be used.');

        this.name = 'PaymentMethodClientUnavailableError';
        this.type = 'payment_method_client_unavailable';
    }
}
