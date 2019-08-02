import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { AdyenClient, AdyenConfiguration, AdyenHostWindow } from './adyenv2';

export default class AdyenV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AdyenHostWindow = window
    ) {}

    load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        return this._loadStylesheet(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.css`)
            .then(() => {
                return this._scriptLoader
                    .loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`)
                    .then(() => {
                        if (!this._window.AdyenCheckout) {
                            throw new StandardError();
                        }

                        return new this._window.AdyenCheckout(configuration);
                    });
                });
    }

    private _loadStylesheet(src: string): Promise<Event> {
        const _stylesheets: { [key: string]: Promise<Event> } = {};
​
        if (!_stylesheets[src]) {
            _stylesheets[src] = new Promise((resolve, reject) => {
                const stylesheet = document.createElement('link') as HTMLLinkElement;
​
                stylesheet.onload = event => resolve(event);
                stylesheet.onerror = event => {
                    delete _stylesheets[src];
                    reject(event);
                };
                stylesheet.rel = 'stylesheet';
                stylesheet.href = src;
​
                document.head.appendChild(stylesheet);
            });
        }
​
        return _stylesheets[src];
    }
}
