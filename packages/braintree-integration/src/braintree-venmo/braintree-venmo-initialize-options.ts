import { BraintreeError, BuyNowCartRequestBody } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {PaypalStyleOptions} from "../../../core/src/payment/strategies/paypal";

export interface BraintreeVenmoButtonInitializeOptions {
    /**
     * A callback that gets called on any error.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: BuyNowInitializeOptions;

    style?: Pick<
        PaypalStyleOptions,
        'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'
    >;
}

export interface BuyNowInitializeOptions {
    getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
}

export interface WithBraintreeVenmoInitializeOptions {
    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoButtonInitializeOptions;
}
