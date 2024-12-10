import { PayPalButtonStyleOptions } from '../paypal-commerce-types';

export default interface PaypalCommerceCreditHeadlessWalletInitializeOptions {
    cartId: string;
    /**
     * A set of styling options for the checkout button.
     */
    style?: PayPalButtonStyleOptions;

    /**
     *
     *  A callback that gets called when PayPal SDK restricts to render PayPal component.
     *
     */
    onEligibilityFailure?(): void;
}

export interface WithPayPalCommerceCreditHeadlessWalletInitializeOptions {
    paypalcommercecredit?: PaypalCommerceCreditHeadlessWalletInitializeOptions;
}
