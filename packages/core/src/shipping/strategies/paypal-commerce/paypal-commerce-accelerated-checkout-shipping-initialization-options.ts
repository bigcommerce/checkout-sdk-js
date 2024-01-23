import { PayPalCommerceConnectStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support PayPal Commerce Accelerated Checkout.
 */
export default interface PayPalCommerceAcceleratedCheckoutShippingInitializeOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * Is a stylisation options for customizing PayPal Connect components
     *
     * Note: the styles for all PayPal Commerce Accelerated Checkout strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalCommerceConnectStylesOption;
}
