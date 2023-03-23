import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BraintreeError } from '../braintree';

export default interface BraintreePaypalCustomerInitializeOptions {
    /**
     * The ID of a container which the checkout button should be inserted into.
     */
    container: string;

    buttonHeight?: number;

    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;
}

export interface WithBraintreePaypalCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalCustomerInitializeOptions;
}
