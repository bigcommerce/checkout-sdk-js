import { BraintreeError, PaypalStyleOptions } from '@bigcommerce/checkout-sdk/braintree-utils';
import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default interface BraintreeVenmoWalletInitializeOptions {
    cartId: string;
    initializationData: string;
    clientToken: string;
    style?: PaypalStyleOptions;
    onAuthorizeError?(error: BraintreeError | StandardError): void;
    onError?(error: BraintreeError | StandardError): void;
    onEligibilityFailure?(): void;
}

export interface WithBraintreeVenmoWalletInitializeOptions {
    braintreevenmo?: BraintreeVenmoWalletInitializeOptions;
}
