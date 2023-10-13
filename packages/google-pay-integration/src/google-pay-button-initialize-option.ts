import { GooglePayKey } from './google-pay-payment-initialize-options';
import {
    GooglePayButtonColor,
    GooglePayButtonType,
    GooglePayBuyNowInitializeOptions,
} from './types';

export interface GooglePayButtonInitializeOptions {
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;

    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: GooglePayButtonType;

    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: GooglePayBuyNowInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    container: string;

    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;

    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;
}

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
export type WithGooglePayButtonInitializeOptions = {
    [k in GooglePayKey]?: GooglePayButtonInitializeOptions;
};
