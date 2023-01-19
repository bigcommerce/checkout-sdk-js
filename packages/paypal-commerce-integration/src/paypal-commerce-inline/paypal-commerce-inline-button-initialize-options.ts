import { PayPalButtonStyleOptions } from '../paypal-commerce-types';

/**
 * A set of options that are required to initialize ApplePay in cart.
 *
 * When ApplePay is initialized, an ApplePay button will be inserted into the
 * DOM. When a customer clicks on it, it will trigger Apple sheet.
 */
export default interface PayPalCommerceInlineButtonInitializeOptions {
    /**
     * A class name used to add special class for container where the button will be generated in
     * Default: 'PaypalCommerceInlineButton'
     */
    buttonContainerClassName?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: Pick<PayPalButtonStyleOptions, 'custom'>;

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete(): void;

    /**
     * A callback that gets called on any error
     */
    onError?(): void;
}

export interface WithPayPalCommerceInlineButtonInitializeOptions {
    paypalcommerceinline?: PayPalCommerceInlineButtonInitializeOptions;
}
