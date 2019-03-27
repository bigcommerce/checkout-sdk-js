import { StandardError } from '../../common/error/errors';

export default class PaymentMethodCancelledError extends StandardError {
    constructor(message?: string) {
        super(message || 'Payment process was cancelled.');

        this.type = 'payment_cancelled';
    }
}
