import { BuyNowCartRequestBody } from '../../../cart';
import { StandardError } from '../../../common/error/errors';
import { BraintreeError } from '../../../payment/strategies/braintree';
import { PaypalStyleOptions } from '../../../payment/strategies/paypal';

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
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };

    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<
        PaypalStyleOptions,
        'layout' | 'size' | 'color' | 'label' | 'shape' | 'tagline' | 'fundingicons' | 'height'
    >;
}
