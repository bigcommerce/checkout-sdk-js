import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayHostWindow, GooglePaymentsClient, GooglePayPaymentOptions } from './types';

export const GOOGLE_PAY_LIBRARY = 'https://pay.google.com/gp/p/js/pay.js';

export default class GooglePayScriptLoader {
    private _paymentsClient?: GooglePaymentsClient;
    private _window: GooglePayHostWindow = window;

    constructor(private _scriptLoader: ScriptLoader) {}

    async getGooglePaymentsClient(
        testMode = false,
        options?: GooglePayPaymentOptions,
    ): Promise<GooglePaymentsClient> {
        await this._scriptLoader.loadScript(GOOGLE_PAY_LIBRARY);

        if (!this._window.google) {
            throw new PaymentMethodClientUnavailableError();
        }

        if (this._paymentsClient === undefined) {
            this._paymentsClient = new this._window.google.payments.api.PaymentsClient({
                environment: testMode ? 'TEST' : 'PRODUCTION',
                ...(options ?? {}),
            });
        }

        return this._paymentsClient;
    }
}
