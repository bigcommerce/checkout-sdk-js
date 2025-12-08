import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { BraintreeFastlaneStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';
import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A union type that covers all possible Fastlane styling options from different providers
 */
export type FastlaneStylesOption = PayPalFastlaneStylesOption | BraintreeFastlaneStylesOption;

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Fastlane (PayPal Commerce, BigCommerce Payments, or Braintree).
 *
 * This is a unified interface that can be used across all Fastlane implementations
 * to simplify initialization and avoid provider-specific checks.
 */
export default interface FastlaneShippingInitializeOptions {
    /**
     * Styling options for customizing Fastlane components
     *
     * Note: the styles for all Fastlane strategies should be the same,
     * because they will be provided to the Fastlane library only for the first strategy initialization
     * no matter what strategy was initialized first
     */
    styles?: FastlaneStylesOption;

    /**
     * A callback that shows the Fastlane popup with customer addresses
     * when triggered
     */
    onPayPalFastlaneAddressChange?: (
        showFastlaneAddressSelector: () => Promise<CustomerAddress | undefined>,
    ) => void;
}
