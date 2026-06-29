import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class CheckoutRedirectError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'An unexpected error has occurred during checkout redirection process. Please try again later.',
        );

        this.name = 'CheckoutRedirectError';
        this.type = 'checkout_redirect_error';
    }
}
