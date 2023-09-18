import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export enum StripeV3ErrorType {
    AuthFailure = 'auth_failure',
}

export default class StripeV3Error extends StandardError {
    subtype: string;

    constructor(subtype: StripeV3ErrorType) {
        super(getErrorMessage(subtype));

        this.type = 'stripev3_error';
        this.subtype = subtype;
    }
}

function getErrorMessage(type: StripeV3ErrorType) {
    switch (type) {
        case StripeV3ErrorType.AuthFailure:
            return `User did not authenticate`;

        default:
            return 'There was an error while processing your payment. Please try again or contact us.';
    }
}
