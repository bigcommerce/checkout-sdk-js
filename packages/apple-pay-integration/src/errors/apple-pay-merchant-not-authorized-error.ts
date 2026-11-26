import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * This error should be thrown when Apple Pay merchant validation responds with
 * 417, meaning the merchant ID is not authorized to process transactions on
 * behalf of the root merchant ID (Mass Enablement / WWDR registration issue).
 */
export default class ApplePayMerchantNotAuthorizedError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'Apple Pay is unavailable: the merchant ID is not authorized to process transactions on behalf of the root merchant ID. Please check the Mass Enablement or WWDR registration.',
        );

        this.name = 'ApplePayMerchantNotAuthorizedError';
        this.type = 'apple_pay_merchant_not_authorized_error';
    }
}
