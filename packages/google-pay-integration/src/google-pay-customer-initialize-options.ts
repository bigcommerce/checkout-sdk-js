import { GooglePayKey } from './google-pay-payment-initialize-options';
import { GooglePayButtonColor, GooglePayButtonType } from './types';

export default interface GooglePayCustomerInitializeOptions {
    /**
     * This container is used to set an event listener, provide an element ID if you want users to be able to launch
     * the GooglePay wallet modal by clicking on a button. It should be an HTML element.
     */
    container: string;

    /**
     * All Google Pay payment buttons exist in two styles: dark (default) and light.
     * To provide contrast, use dark buttons on light backgrounds and light buttons on dark or colorful backgrounds.
     */
    buttonColor?: GooglePayButtonColor;

    /**
     * Variant buttons:
     * book: The "Book with Google Pay" payment button.
     * buy: The "Buy with Google Pay" payment button.
     * checkout: The "Checkout with Google Pay" payment button.
     * donate: The "Donate with Google Pay" payment button.
     * order: The "Order with Google Pay" payment button.
     * pay: The "Pay with Google Pay" payment button.
     * plain: The Google Pay payment button without the additional text (default).
     * subscribe: The "Subscribe with Google Pay" payment button.
     *
     * Note: "long" and "short" button types have been renamed to "buy" and "plain", but are still valid button types
     * for backwards compatability.
     */
    buttonType?: GooglePayButtonType;

    /**
     * Require GooglePay to provide shipping address and methods.
     */
    requireShippingAddress?: boolean;

    /**
     * A callback that gets called when GooglePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * Callback that get called on wallet button click
     */
    onClick?(): void;
}

/**
 * The options that are required to initialize the GooglePay payment method.
 * They can be omitted unless you need to support GooglePay.
 */
export type WithGooglePayCustomerInitializeOptions = {
    [k in GooglePayKey]?: GooglePayCustomerInitializeOptions;
};
