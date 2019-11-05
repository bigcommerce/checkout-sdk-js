import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';

export default class PaypalScriptLoader {
    private _window: PaypalHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    async loadPaypal(merchantId: string = ''): Promise<PaypalSDK> {
        const scriptSrc = '//www.paypalobjects.com/api/checkout.min.js';
        const options: LoadScriptOptions = { async: true, attributes: { 'data-merchant-id': merchantId } };

        merchantId
            ? await this._scriptLoader.loadScript(scriptSrc, options)
            : await this._scriptLoader.loadScript(scriptSrc);

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }
}
