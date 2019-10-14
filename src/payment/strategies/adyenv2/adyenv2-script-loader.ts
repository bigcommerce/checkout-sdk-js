import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenCheckout, AdyenConfiguration, AdyenHostWindow } from './adyenv2';

export default class AdyenV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenHostWindow = window
    ) {}

    load(configuration: AdyenConfiguration): Promise<AdyenCheckout> {
        return Promise.all([
            this._stylesheetLoader.loadStylesheet(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.css`),
            this._scriptLoader.loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`),
        ])
        .then(() => {
            if (!this._window.AdyenCheckout) {
                throw new PaymentMethodClientUnavailableError();
            }

            return new this._window.AdyenCheckout(configuration);
        })
        .catch(() => {
            throw new PaymentMethodClientUnavailableError();
        });
    }
}
