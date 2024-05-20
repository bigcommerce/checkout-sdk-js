import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';
/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Braintree Fastlane.
 */
export default interface BraintreeFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing PayPal Fastlane components
     *
     * Note: the styles for all Braintree Fastlane strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeFastlaneStylesOption;
    /**
     * Is a callback that shows Braintree Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (
        showBraintreeFastlaneAddressSelector: () => Promise<CustomerAddress | undefined>,
    ) => void;
}
