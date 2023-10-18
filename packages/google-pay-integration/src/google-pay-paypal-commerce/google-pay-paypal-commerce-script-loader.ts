import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayConfig, PayPalCommerceHostWindow, PayPalGoogleSdk } from './types';

export default class GooglePayPayPalCommerceScriptLoader {
    private window: PayPalCommerceHostWindow;
    private googlepayConfig?: GooglePayConfig;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async loadPayPalGooglePaySDK(
        clientId: string,
        merchantId: string,
        clientToken: string,
    ): Promise<PayPalGoogleSdk> {
        const scriptSrc = `https://www.paypal.com/sdk/js?components=googlepay&client-id=${clientId}&merchant-id=${merchantId}`;

        await this.scriptLoader.loadScript(scriptSrc, {
            async: true,
            attributes: {
                'data-client-token': clientToken,
                'data-partner-attribution-id': 'GOOGLEPAY',
            },
        });

        if (!this.window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypal;
    }

    async getPayPalGooglePaySdkOrThrow(
        clientId?: string,
        merchantId?: string,
        clientToken?: string,
    ) {
        if (!this.window.paypal?.Googlepay) {
            if (!clientId || !merchantId || !clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const payPalScript = await this.loadPayPalGooglePaySDK(
                clientId,
                merchantId,
                clientToken,
            );

            this.window.paypal = payPalScript;
        }

        return this.window.paypal;
    }

    async getGooglePayConfigOrThrow(clientId?: string, merchantId?: string, clientToken?: string) {
        if (!this.window.paypal?.Googlepay) {
            if (!clientId || !merchantId || !clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this.window.paypal = await this.getPayPalGooglePaySdkOrThrow(
                clientId,
                merchantId,
                clientToken,
            );
        }

        if (!this.googlepayConfig) {
            this.googlepayConfig = await this.window.paypal.Googlepay().config();
        }

        return this.googlepayConfig;
    }
}
