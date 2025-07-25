import { BraintreeFormOptions } from '@bigcommerce/checkout-sdk/braintree-utils';

export interface BraintreeCreditCardPaymentInitializeOptions {
    form: BraintreeFormOptions;
    unsupportedCardBrands: string[];
}

export interface WithBraintreeCreditCardPaymentInitializeOptions {
    /**
     * The options that are required to initialize Braintree PayPal wallet button on Product and Cart page.
     */
    braintree?: BraintreeCreditCardPaymentInitializeOptions;
}
