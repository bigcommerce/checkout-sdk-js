import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/paypal-utils';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support PayPal Commerce Fastlane.
 */
export default interface PayPalCommerceFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all PayPal Commerce Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;

    /**
     * Is a callback that shows PayPal Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (
        showPayPalFastlaneAddressSelector: () => Promise<CustomerAddress | undefined>,
    ) => void;
}
