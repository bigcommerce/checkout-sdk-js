import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class AmazonPayV2ConfigCreationError extends StandardError {
    constructor(message?: string) {
        super(
            message ||
                'An unexpected error has occurred during config creation process. Please try again later.',
        );

        this.name = 'AmazonPayV2ConfigCreationError';
        this.type = 'amazon_pay_v2_config_creation_error';
    }
}
