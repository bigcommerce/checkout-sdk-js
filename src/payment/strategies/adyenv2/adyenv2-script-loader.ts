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
        const checkSums: { [id: string]: string } = {
            test: 'sha384-j+P95C9gdyJZ9LTUtvrMDElDvFEeTCelUsE89yfnDfP7nbOXS3N0+e5nb0CLTdx/',
            live: 'sha384-rwJ33r9d5uXn5L8KSr4UqcaSaAHs2NQNjtNCvclBkZ8P36yDAXQq65YPX+q1LiEr',
        };

        await Promise.all([
            this._stylesheetLoader.loadStylesheet(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.8.0/adyen.css`, {
                prepend: true,
                attributes: {
                    integrity: 'sha384-y1lKqffK5z+ENzddmGIfP3bcMRobxkjDt/9lyPAvV9H3JXbJYxCSD6L8TdyRMCGM',
                    crossorigin: 'anonymous',
                },
            }),
            this._scriptLoader.loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.8.0/adyen.js`, {
                    async: false,
                    attributes: {
                        integrity: checkSums[configuration.environment ? configuration.environment : 'test'],
                        crossorigin: 'anonymous',
                    },
                }),
        ]);

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return new this._window.AdyenCheckout(configuration);
    }
}
