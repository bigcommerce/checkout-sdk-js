import { StandardError } from '../../common/error/errors';

export default class PaymentMethodCancelledError extends StandardError {
    constructor(message?: string) {
        super(message || 'Payment process was cancelled.');

        this.name = 'PaymentMethodCancelledError';
        this.type = 'payment_cancelled';
    }
}
