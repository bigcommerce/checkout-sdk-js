import {
    BraintreeFormOptions,
    BraintreeThreeDSecureOptions,
} from '@bigcommerce/checkout-sdk/braintree-utils';

export interface BraintreePaypalPaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;

    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    form?: BraintreeFormOptions;

    /**
     * The location to insert the Pay Later Messages.
     */
    bannerContainerId?: string;

    /**
     * A callback for displaying error popup. This callback requires error object as parameter.
     */
    onError?(error: unknown): void;
}

export interface WithBraintreePaypalPaymentInitializeOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal.
     */
    braintree?: BraintreePaypalPaymentInitializeOptions;
}
