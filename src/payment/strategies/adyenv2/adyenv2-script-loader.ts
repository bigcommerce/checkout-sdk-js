import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenClient, AdyenConfiguration, AdyenHostWindow } from './adyenv2';

export default class AdyenV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenHostWindow = window
    ) { }

    async load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.10.1/adyen.css`),
            this._scriptLoader.loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js`),
        ]);

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return new this._window.AdyenCheckout(configuration);
    }
}
