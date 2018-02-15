/// <reference path="./amazon-login.d.ts" />

import { PaymentMethod } from '../../../payment';
import ScriptLoader from '../../../../script-loader/script-loader';

export default class AmazonPayScriptLoader {
    private _window: amazon.HostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    loadWidget(method: PaymentMethod): Promise<Event> {
        const {
            config: { merchantId, testMode },
            initializationData: { region = 'us' } = {},
        } = method;

        const url = 'https://static-na.payments-amazon.com/OffAmazonPayments/' +
            `${region.toLowerCase()}/` +
            (testMode ? 'sandbox/' : '') +
            (region.toLowerCase() !== 'us' ? 'lpa/' : '') +
            `js/Widgets.js?sellerId=${merchantId}`;

        this._configureWidget(method);

        return this._scriptLoader.loadScript(url);
    }

    private _configureWidget(method: PaymentMethod): void {
        if (this._window.onAmazonLoginReady) {
            return;
        }

        this._window.onAmazonLoginReady = () => {
            amazon.Login.setClientId(method.initializationData.clientId);
            amazon.Login.setUseCookie(true);
        };
    }
}
