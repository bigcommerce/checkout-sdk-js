import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import {
    AdyenCheckout,
    AdyenConfiguration,
    AdyenHostWindow
} from './adyenv2';

export default class AdyenV2ScriptLoader {
    private _stylesheets: { [key: string]: Promise<Event> } = {};

    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AdyenHostWindow = window
    ) {}

    load(configuration: AdyenConfiguration): Promise<AdyenCheckout> {
        return this._loadStylesheet(
            `https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.css`
        ).then(() => {
            return this._scriptLoader
                .loadScript(`https://checkoutshopper-${configuration.environment}.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`)
                .then(() => {
                    if (!this._window.AdyenCheckout) {
                        throw new StandardError();
                    }

                    return new this._window.AdyenCheckout(configuration);
                });
        }).catch(() => {
            throw new StandardError();
        });

    }

    private _loadStylesheet(src: string): Promise<Event> {
        if (!this._stylesheets[src]) {
            this._stylesheets[src] = new Promise((resolve, reject) => {
                const stylesheet = document.createElement('link');

                stylesheet.onload = event => {
                    resolve(event);
                };
                stylesheet.onerror = event => {
                    delete this._stylesheets[src];
                    reject(event);
                };
                stylesheet.type = 'text/css';
                stylesheet.rel = 'stylesheet';
                stylesheet.href = src;

                document.head.appendChild(stylesheet);
            });
        }

        return this._stylesheets[src];
    }
}
