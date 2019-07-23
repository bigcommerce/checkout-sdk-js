import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { AdyenCheckout, AdyenHostWindow, AdyenJsOptions } from './adyenv2';

export default class AdyenV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AdyenHostWindow = window
    ) {}

    load(configuration: AdyenJsOptions): Promise<AdyenCheckout> {
        return this._scriptLoader
            .loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`)
            .then(() => {
                if (!this._window.AdyenCheckout) {
                    throw new StandardError();
                }

                return new this._window.AdyenCheckout(configuration);
            });
    }
}
