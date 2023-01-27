import { Address } from '../../../address';
import { BuyNowCartRequestBody } from '../../../cart';
import { StandardError } from '../../../common/error/errors';
import { BraintreeError } from '../../../payment/strategies/braintree';
import { PaypalStyleOptions } from '../../../payment/strategies/paypal';

export interface BraintreePaypalButtonInitializeOptions {
    /**
     * @internal
     * This is an internal property and therefore subject to change. DO NOT USE.
     */
    shouldProcessPayment?: boolean;

    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;

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
     * The option that used to initialize a PayPal script with provided currency code.
     */
    currencyCode?: string;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}
