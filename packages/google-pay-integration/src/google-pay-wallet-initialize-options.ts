import type { ShippingLineItem } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import { GooglePayButtonColor, GooglePayButtonType } from './types';

export default interface GooglePayWalletInitializeOptions {
    cartId: string;
    currency: {
        code: string;
        /**
         * Used to format the total price shown on the payment sheet, e.g. 3 for KWD.
         */
        decimalPlaces: number;
    };
    amount: number;
    /**
     * Base64 encoded payment method returned by the wallet buttons GraphQL query.
     */
    initializationData: string;
    /**
     * Required by gateways that tokenize through their own client SDK (e.g. Braintree).
     */
    clientToken?: string;
    lineItems?: ShippingLineItem[];
    supportedShippingCountriesCodes?: string[];
    buttonColor?: GooglePayButtonColor;
    buttonType?: GooglePayButtonType;
    onAuthorizeError?(error: Error): void;
    onError?(error: Error): void;
    onEligibilityFailure?(): void;
}

export interface WithGooglePayWalletInitializeOptions {
    braintreegooglepay?: GooglePayWalletInitializeOptions;
    bigcommerce_paymentsgooglepay?: GooglePayWalletInitializeOptions;
    paypalcommercegooglepay?: GooglePayWalletInitializeOptions;
}
