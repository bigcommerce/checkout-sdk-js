import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaCredit from './klarna-credit';
import KlarnaWindow from './klarna-window';

const SDK_URL = '//credit.klarnacdn.net/lib/v1/api.js';

export default class KlarnaScriptLoader {
    constructor(private scriptLoader: ScriptLoader, private klarnaWindow: KlarnaWindow = window) {}

    async load(): Promise<KlarnaCredit> {
        if (!this.klarnaWindow.Klarna?.Credit) {
            await this.scriptLoader.loadScript(SDK_URL);
        }

        if (!this.klarnaWindow.Klarna?.Credit) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.klarnaWindow.Klarna.Credit;
    }
}
