import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class PaymentOrderCreationError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'An unexpected error has occurred during payment order creation process. Please try again later.',
        );

        this.name = 'PaymentOrderCreationError';
        this.type = 'payment_order_creation_error';
    }
}
