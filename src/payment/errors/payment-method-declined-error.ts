import { StandardError } from '../../common/error/errors';

export default class PaymentMethodDeclinedError extends StandardError {
    constructor(message?: string) {
        super(message || 'The selected payment method was declined. Please select another payment method.');

        this.type = 'payment_declined';
    }
}
