import { BraintreeError, PaypalStyleOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    Address,
    BuyNowCartRequestBody,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };

    /**
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;

    /**
     * @internal
     * This is an internal property and therefore subject to change. DO NOT USE.
     */
    shouldProcessPayment?: boolean;

    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<
        PaypalStyleOptions,
        'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'
    >;

    /**
     * Address to be used for shipping.
     * If not provided, it will use the first saved address from the active customer.
     */
    shippingAddress?: Address | null;

    /**
     * A callback that gets called if unable to authorize and tokenize payment.
     *
     * @param error - The error object describing the failure.
     */
    onAuthorizeError?(error: BraintreeError | StandardError): void;

    /**
     * A callback that gets called if unable to submit payment.
     *
     * @param error - The error object describing the failure.
     */
    onPaymentError?(error: BraintreeError | StandardError): void;

    /**
     * A callback that gets called on any error instead of submit payment or authorization errors.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: BraintreeError | StandardError): void;

    /**
     *
     *  A callback that gets called when Braintree SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithBraintreePaypalButtonInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
}
