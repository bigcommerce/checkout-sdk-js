import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

const defaultMessage =
    'There was an error while processing your payment. Please try again or contact us.';

export default class DigitalRiverError extends StandardError {
    constructor(type: string, name: string, message?: string) {
        super(message || defaultMessage);

        this.type = type;
        this.name = name;
    }
}
