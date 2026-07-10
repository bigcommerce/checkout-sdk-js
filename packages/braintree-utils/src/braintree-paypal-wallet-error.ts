import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * Throw this error if the Braintree PayPal wallet flow fails to redirect the
 * shopper to the external checkout page.
 */
export default class BraintreePaypalWalletError extends StandardError {
    constructor(message?: string) {
        super(message || 'Failed to redirect to checkout page');

        this.name = 'BraintreePaypalWalletError';
        this.type = 'braintree_paypal_wallet';
    }
}
