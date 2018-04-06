import { StandardError } from '../../common/error/errors';

export default class PaymentMethodCancelledError extends StandardError {
    constructor() {
        super('Payment process was cancelled.');

        this.type = 'payment_cancelled';
    }
}
