import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaypalStyleOptions } from './paypal-express-types';

export interface PaypalExpressButtonInitializeOptions {
    /**
     * @internal
     * This is an internal property and therefore subject to change. DO NOT USE.
     */
    shouldProcessPayment?: boolean;

    /**
     * The Client ID of the Paypal App
     */
    clientId: string;

    /**
     * Whether or not to show a credit button.
     */
    allowCredit?: boolean;

    /**
     * A set of styling options for the checkout button.
     */
    style?: Omit<PaypalStyleOptions, 'height'>;

    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: StandardError): void;

    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: StandardError): void;
}

export interface WithPaypalExpressButtonInitializeOptions {
    paypal: PaypalExpressButtonInitializeOptions;
}
