import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaPayments from './klarna-payments';
import KlarnaV2Window from './klarnav2-window';

const SDK_URL = 'https://x.klarnacdn.net/kp/lib/v1/api.js';

export default class KlarnaV2ScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private klarnaWindow: KlarnaV2Window = window,
    ) {}

    async load(): Promise<KlarnaPayments> {
        if (!this.klarnaWindow.Klarna?.Payments) {
            await this.scriptLoader.loadScript(SDK_URL);
        }

        if (!this.klarnaWindow.Klarna?.Payments) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.klarnaWindow.Klarna.Payments;
    }
}
