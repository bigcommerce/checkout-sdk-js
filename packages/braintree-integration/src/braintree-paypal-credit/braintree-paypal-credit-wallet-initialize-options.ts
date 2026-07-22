import { BraintreeError, PaypalStyleOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BraintreePaypalCreditWalletInitializeOptions {
    cartId: string;
    amount: number;
    currency: {
        code: string;
    };
    initializationData: string;
    clientToken: string;
    style?: PaypalStyleOptions;
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    onPaymentError?(error: BraintreeError | StandardError): void;
    onError?(error: BraintreeError | StandardError): void;
    onEligibilityFailure?(): void;
}

export interface WithBraintreePaypalCreditWalletInitializeOptions {
    braintreepaypalcredit?: BraintreePaypalCreditWalletInitializeOptions;
}
