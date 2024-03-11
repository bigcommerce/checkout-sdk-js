import { BraintreeError } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BraintreePaypalCreditCustomerInitializeOptions {
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

    /**
     * A callback that gets called when wallet button clicked
     */
    onClick?(): void;
}

export interface WithBraintreePaypalCreditCustomerInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintreepaypalcredit?: BraintreePaypalCreditCustomerInitializeOptions;
}
