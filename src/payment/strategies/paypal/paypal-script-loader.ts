import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';

export default class PaypalScriptLoader {
    private _window: PaypalHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    loadPaypal(): Promise<PaypalSDK> {
        return this._scriptLoader
            .loadScript('//www.paypalobjects.com/api/checkout.min.js')
            .then(() => {
                if (!this._window.paypal) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.paypal;
            });
    }
}
