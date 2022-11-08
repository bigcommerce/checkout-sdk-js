import { PaypalButtonStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceInlineCheckoutButtonInitializeOptions {
    /**
     * A class name used to add special class for container where the button will be generated in
     * Default: 'PaypalCommerceInlineButton'
     */
    buttonContainerClassName?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions;

    /**
     * A callback that gets called when payment complete on paypal side.
     */
    onComplete(): void;

    /**
     * A callback that gets called on any error
     */
    onError?(): void;
}
