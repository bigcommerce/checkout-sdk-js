import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdyenClient, AdyenConfiguration, AdyenV3HostWindow } from '../types';

export default class AdyenV3ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenV3HostWindow = window,
    ) {}

    async load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/6.44.0/adyen.css`,
                {
                    prepend: false,
                    attributes: {
                        integrity:
                            'sha384-PWrMXiOTu6vDvUL+llWHVeWnBIxMTJ6PxGu6f8gKPGpoklzxJxRmeuOgVHE8Xk5U',
                        crossorigin: 'anonymous',
                    },
                },
            ),
            this._scriptLoader.loadScript(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/6.44.0/adyen.js`,
                {
                    async: true,
                    attributes: {
                        integrity:
                            'sha384-eFpi7m7SawN2cMRhljHMUvdeYR9Hi6dWhw40OEHv5HNavDq6Gdhsnch9FcdU3+JZ',
                        crossorigin: 'anonymous',
                    },
                },
            ),
        ]);

        if (!this._window.AdyenWeb) {
            throw new PaymentMethodClientUnavailableError();
        }

        const checkout = await this._window.AdyenWeb.AdyenCheckout(configuration);

        return checkout;
    }
}
