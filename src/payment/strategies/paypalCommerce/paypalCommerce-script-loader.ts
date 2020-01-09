import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalCommerceHostWindow, PaypalCommerceSDK } from './paypalCommerce-sdk';

export default class PaypalCommerceScriptLoader {
    private _window: PaypalCommerceHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    async loadPaypalCommerce(clientId: string = '', currency: string = 'USD'): Promise<PaypalCommerceSDK> {
        const scriptSrc = `https://www.paypal.com/sdk/js?currency=${currency}&client-id=${clientId}`;

        await this._scriptLoader.loadScript(scriptSrc, { async: true, attributes: {} });

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }
}
