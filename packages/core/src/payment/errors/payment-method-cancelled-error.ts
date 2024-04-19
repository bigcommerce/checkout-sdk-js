import { StandardError } from '../../common/error/errors';

/**
 * This error should be thrown when the payment flow is cancelled. It could be
 * due to a deliberate user interaction, i.e.: the user clicks on a cancel
 * button which dismisses the payment modal.
 */
export default class PaymentMethodCancelledError extends StandardError {
    constructor(message?: string) {
        super(message || 'Payment process was cancelled.');

        this.name = 'PaymentMethodCancelledError';
        this.type = 'payment_cancelled';
    }
}
