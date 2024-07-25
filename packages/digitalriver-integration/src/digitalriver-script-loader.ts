import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import DigitalRiverJS, { DigitalRiverWindow } from './digitalriver';

export default class DigitalRiverScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stylesheetLoader: StylesheetLoader,
        private _window: DigitalRiverWindow = window,
    ) {}

    async load(publicKey: string, locale: string): Promise<DigitalRiverJS> {
        await Promise.all([
            this.stylesheetLoader.loadStylesheet(
                `https://js.digitalriverws.com/v1/css/DigitalRiver.css`,
            ),
            this.scriptLoader.loadScript(`https://js.digitalriverws.com/v1/DigitalRiver.js`),
        ]);

        if (!this._window.DigitalRiver) {
            throw new PaymentMethodClientUnavailableError();
        }

        return Promise.resolve(new this._window.DigitalRiver(publicKey, { locale }));
    }
}
