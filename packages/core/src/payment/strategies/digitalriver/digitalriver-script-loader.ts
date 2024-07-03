import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import DigitalRiverJS, { DigitalRiverWindow } from './digitalriver';

export default class DigitalRiverScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: DigitalRiverWindow = window,
    ) {}

    async load(publicKey: string, locale: string): Promise<DigitalRiverJS | undefined> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(
                `https://js.digitalriverws.com/v1/css/DigitalRiver.css`,
            ),
            this._scriptLoader.loadScript(`https://js.digitalriverws.com/v1/DigitalRiver.js`),
        ]);

        if (!this._window.DigitalRiver) {
            throw new PaymentMethodClientUnavailableError();
        }

        return Promise.resolve(new this._window.DigitalRiver(publicKey, { locale }));
    }
}
