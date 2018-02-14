/// <reference path="./amazon-login.d.ts" />

import { PaymentMethod } from '../../../payment';
import ScriptLoader from '../../../../script-loader/script-loader';

export default class AmazonPayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

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
        const global: any = window;

        if (global.onAmazonLoginReady) {
            return;
        }

        global.onAmazonLoginReady = () => {
            amazon.Login.setClientId(method.initializationData.clientId);
            amazon.Login.setUseCookie(true);
        };
    }
}
