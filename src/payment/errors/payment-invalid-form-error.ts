import { StandardError } from '../../common/error/errors';

export interface PaymentInvalidFormErrorDetails {
    [key: string]: Array<{ message: string; type: string }>;
}

export default class PaymentInvalidFormError extends StandardError {
    constructor(
        public details: PaymentInvalidFormErrorDetails,
        message?: string
    ) {
        super(message || 'Unable to proceed because the payment form contains invalid data.');

        this.name = 'PaymentInvalidFormError';
        this.type = 'payment_invalid_form';
    }
}
