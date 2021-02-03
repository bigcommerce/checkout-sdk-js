import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenClient, AdyenConfiguration, AdyenHostWindow } from './adyenv2';

enum AdyenAssetFileType {
    JS = 'js',
    CSS = 'css',
}

const WEB_COMPONENTS: Readonly<{ VERSION: string; SRI: { [key: string]: string } }> = {
    VERSION: '3.20.0',
    SRI: {
        js: 'sha384-UNqekQqUbhwebnism+MhmqRqTuLtMCz7O/dMCjBuMZEoj61mhjM84R+jZDB2BIEg',
        css: 'sha384-jXPa2gofpP6MkO/994dAS/W4pn9MgcK9IOebe5jKpnRmzMAvnxBspvqQVpU3jjIH',
    },
};

export default class AdyenV2ScriptLoader {
    private environment?: string;

    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenHostWindow = window
    ) { }

    async load(configuration: AdyenConfiguration): Promise<AdyenClient> {
        this.environment = configuration.environment;

        await Promise.all([AdyenAssetFileType.JS, AdyenAssetFileType.CSS].map(this._loadAsset));

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return new this._window.AdyenCheckout(configuration);
    }

    private _loadAsset = (fileType: AdyenAssetFileType): Promise<void> => {
        const url = `https://checkoutshopper-${this.environment}.adyen.com/checkoutshopper/sdk/${WEB_COMPONENTS.VERSION}/adyen.${fileType}`;
        const options = {
            attributes: {
                integrity: WEB_COMPONENTS.SRI[fileType],
                crossorigin: 'anonymous',
            },
        };

        return fileType === AdyenAssetFileType.JS
            ? this._scriptLoader.loadScript(url, { async: false, ...options })
            : fileType === AdyenAssetFileType.CSS
                ? this._stylesheetLoader.loadStylesheet(url, { prepend: false, ...options })
                : Promise.resolve();
    };
}
