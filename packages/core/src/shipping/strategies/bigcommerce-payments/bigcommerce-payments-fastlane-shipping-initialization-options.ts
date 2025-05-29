import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import { CustomerAddress } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support BigCommercePayments  Fastlane.
 */
export default interface BigCommercePaymentsFastlaneShippingInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommercePayments Fastlane components
     *
     * Note: the styles for all BigCommercePayments Fastlane strategies should be the same,
     * because they will be provided to fastlane library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;

    /**
     * Is a callback that shows BigCommercePayments Fastlane popup with customer addresses
     * when get triggered
     */
    onPayPalFastlaneAddressChange?: (
        showPayPalFastlaneAddressSelector: () => Promise<CustomerAddress | undefined>,
    ) => void;
}
