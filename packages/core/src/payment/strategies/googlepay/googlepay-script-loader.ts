import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { GooglePayHostWindow, GooglePaySDK } from './googlepay';

export default class GooglePayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: GooglePayHostWindow = window
    ) {}

    load(): Promise<GooglePaySDK> {
        return this._scriptLoader
            .loadScript('https://pay.google.com/gp/p/js/pay.js')
            .then(() => {
                if (!this._window.google) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.google;
            });
    }
}
