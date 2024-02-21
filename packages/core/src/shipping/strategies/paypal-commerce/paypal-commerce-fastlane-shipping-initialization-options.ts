import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support PayPal Commerce Fastlane.
 */
export default interface PayPalCommerceFastlaneShippingInitializeOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPal Commerce Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}
