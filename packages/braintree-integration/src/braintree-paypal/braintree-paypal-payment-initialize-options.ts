import {
    BraintreeError,
    BraintreeFormOptions,
    BraintreeThreeDSecureOptions,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface BraintreePaypalPaymentInitializeOptions {
    /**
     * The CSS selector of a container where the payment widget should be inserted into.
     */
    containerId?: string;

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
     * A callback right before render Smart Payment Button that gets called when
     * Smart Payment Button is eligible. This callback can be used to hide the standard submit button.
     */
    onRenderButton?(): void;

    /**
     * A callback for submitting payment form that gets called
     * when buyer approved PayPal account.
     */
    submitForm?(): void;

    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;

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
