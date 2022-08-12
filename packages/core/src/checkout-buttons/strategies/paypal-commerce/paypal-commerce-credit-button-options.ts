import { PaypalButtonStyleOptions } from '../../../payment/strategies/paypal-commerce';

export interface PaypalCommerceCreditButtonInitializeOptions {
    /**
     * Flag which helps to detect that the strategy initializes on Checkout page
     */
    initializesOnCheckoutPage?: boolean;

    /**
     * The ID of a container which the messaging should be inserted.
     */
    messagingContainerId?: string;

    /**
     * A set of styling options for the checkout button.
     */
    style?: PaypalButtonStyleOptions;
}
