import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdyenClient, AdyenConfiguration, AdyenV3HostWindow } from '../types';

const LEGACY_SDK_VERSION = '5.71.1';
const LEGACY_SDK_INTEGRITY = {
    css: 'sha384-5MvB4RnzvviA3VBT4KYABZ4HXNZG5LRqREEgd41xt/pf/QvKmsj2O9GuNuywRXx9',
    js: 'sha384-yvY2yFNR4WqIjPqP9MzjI+gJimmaJnAvj4rLHKvgJbgFD5fMuf8zIJrFJOW8Lhhf',
};

const UPGRADED_SDK_VERSION = '6.44.0';
const UPGRADED_SDK_INTEGRITY = {
    css: 'sha384-PWrMXiOTu6vDvUL+llWHVeWnBIxMTJ6PxGu6f8gKPGpoklzxJxRmeuOgVHE8Xk5U',
    js: 'sha384-eFpi7m7SawN2cMRhljHMUvdeYR9Hi6dWhw40OEHv5HNavDq6Gdhsnch9FcdU3+JZ',
};

export default class AdyenV3ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: AdyenV3HostWindow = window,
    ) {}

    async load(
        configuration: AdyenConfiguration,
        isAdyenSdkUpgradeEnabled = false,
    ): Promise<AdyenClient> {
        const version = isAdyenSdkUpgradeEnabled ? UPGRADED_SDK_VERSION : LEGACY_SDK_VERSION;
        const integrity = isAdyenSdkUpgradeEnabled ? UPGRADED_SDK_INTEGRITY : LEGACY_SDK_INTEGRITY;

        await Promise.all([
            this._stylesheetLoader.loadStylesheet(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/${version}/adyen.css`,
                {
                    prepend: false,
                    attributes: {
                        integrity: integrity.css,
                        crossorigin: 'anonymous',
                    },
                },
            ),
            this._scriptLoader.loadScript(
                `https://checkoutshopper-${
                    configuration.environment ?? ''
                }.adyen.com/checkoutshopper/sdk/${version}/adyen.js`,
                {
                    async: true,
                    attributes: {
                        integrity: integrity.js,
                        crossorigin: 'anonymous',
                    },
                },
            ),
        ]);

        if (isAdyenSdkUpgradeEnabled) {
            const adyenWeb = this._window.AdyenWeb;

            if (!adyenWeb) {
                throw new PaymentMethodClientUnavailableError();
            }

            const checkout = await adyenWeb.AdyenCheckout(configuration);

            checkout.createComponent = (type, componentOptions) =>
                adyenWeb.createComponent(type, checkout, componentOptions);

            return checkout;
        }

        if (!this._window.AdyenCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.AdyenCheckout(configuration);
    }
}
