import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if a payment method explicitly returns a declined error and
 * the shopper has to choose a different payment method if they wish to continue
 * their checkout process.
 */
export default class PaymentMethodDeclinedError extends StandardError {
    constructor(message?: string) {
        super(message || 'The selected payment method was declined. Please select another payment method.');

        this.name = 'PaymentMethodDeclinedError';
        this.type = 'payment_declined';
    }
}
