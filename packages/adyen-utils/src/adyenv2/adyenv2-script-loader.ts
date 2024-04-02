import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdyenClient, AdyenConfiguration, AdyenV2HostWindow } from '../types';

export default class AdyenV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenV2HostWindow = window,
    ) {}

    async load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/3.10.1/adyen.css`,
            ),
            this._scriptLoader.loadScript(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js`,
            ),
        ]);

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return new this._window.AdyenCheckout(configuration);
    }
}
