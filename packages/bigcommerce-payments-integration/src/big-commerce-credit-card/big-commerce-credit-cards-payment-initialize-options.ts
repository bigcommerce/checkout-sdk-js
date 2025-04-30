import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BigCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form: HostedFormOptions;

    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

// TODO: this interface should be removed
// We should give some time for other developers to update their PPC CC components
// with paypalcommercecreditcard.form instead of paypalcommerce.form.
// The interface can be removed after 14.06.2023
export interface DeprecatedBigCommerceCreditCardsPaymentInitializeOptions {
    /**
     * The form is data for Credit Card Form
     */
    form?: HostedFormOptions;

    /**
     * The callback that gets called when there is an issue with rendering credit card fields
     */
    onCreditCardFieldsRenderingError?: (error: unknown) => void;
}

export interface WithBigCommerceCreditCardsPaymentInitializeOptions {
    bigcommerce_payments_creditcard?: BigCommerceCreditCardsPaymentInitializeOptions;
    bigcommerce?: DeprecatedBigCommerceCreditCardsPaymentInitializeOptions; // FIXME: the option is deprecated
}
