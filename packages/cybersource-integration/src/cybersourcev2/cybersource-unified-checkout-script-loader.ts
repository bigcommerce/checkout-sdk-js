import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { UnifiedCheckoutSDK, UnifiedCheckoutWindow } from './cybersource-unified-checkout';

// TODO: Verify exact SDK URLs with Cybersource Unified Checkout V1 documentation
const SDK_TEST_URL =
    'https://unified-dev.cybersource.com/commerce/1.0/client-sdk/cs-unified-checkout.js';
const SDK_PROD_URL =
    'https://unified.cybersource.com/commerce/1.0/client-sdk/cs-unified-checkout.js';

export default class CybersourceUnifiedCheckoutScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: UnifiedCheckoutWindow = window,
    ) {}

    async load(testMode?: boolean): Promise<UnifiedCheckoutSDK> {
        const url = testMode ? SDK_TEST_URL : SDK_PROD_URL;

        await this._scriptLoader.loadScript(url);

        if (!this._window.UnifiedCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.UnifiedCheckout;
    }
}
