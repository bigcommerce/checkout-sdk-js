import { PayPalFastlaneStylesOption } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

export default interface BigCommerceFastlaneCustomerInitializeOptions {
    /**
     * Is a stylisation options for customizing BigCommerce Fastlane components
     *
     * Note: the styles for all BigCommerce Fastlane strategies should be the same,
     * because they will be provided to BigCommerce library only for the first strategy initialization
     * no matter which strategy was initialised first
     */
    styles?: PayPalFastlaneStylesOption;
}

export interface WithBigCommerceFastlaneCustomerInitializeOptions {
    bigcommerce_payments_fastlane?: BigCommerceFastlaneCustomerInitializeOptions;
}
