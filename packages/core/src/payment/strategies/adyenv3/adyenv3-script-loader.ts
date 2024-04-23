import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenClient, AdyenConfiguration, AdyenHostWindow } from './adyenv3';

export default class AdyenV3ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenHostWindow = window,
    ) {}

    async load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/5.58.0/adyen.css`,
                {
                    prepend: false,
                    attributes: {
                        integrity:
                            'sha384-zgFNrGzbwuX5qJLys75cOUIGru/BoEzhGMyC07I3OSdHqXuhUfoDPVG03G+61oF4',
                        crossorigin: 'anonymous',
                    },
                },
            ),
            this._scriptLoader.loadScript(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/5.58.0/adyen.js`,
                {
                    async: true,
                    attributes: {
                        integrity:
                            'sha384-e0EBlzLdOXxOJimp2uut2z1m98HS2cdhQw+OmeJDp7MRCPRNrQhjIWZiWiIscJvf',
                        crossorigin: 'anonymous',
                    },
                },
            ),
        ]);

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        const checkout = await this._window.AdyenCheckout(configuration);

        return checkout;
    }
}
