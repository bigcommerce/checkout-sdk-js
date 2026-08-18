import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CardinalSDK, CardinalWindow } from './cardinal';

const SDK_TEST_URL = 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js';

const SDK_UPDATED_TEST_URL =
    'https://cas.static.client.cardinaltrusted.com/songbird/v2.0.0/songbird.js';

const SDK_PROD_URL = 'https://static.client.cardinaltrusted.com/songbird/v2.0.0/songbird.js';

export default class CardinalScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, private _window: CardinalWindow = window) {}

    load(
        provider: string,
        testMode?: boolean,
        isCyberSourceUpdatedTestUrlEnabled?: boolean,
    ): Promise<CardinalSDK> {
        const testUrl = isCyberSourceUpdatedTestUrlEnabled ? SDK_UPDATED_TEST_URL : SDK_TEST_URL;
        const url = testMode ? testUrl : SDK_PROD_URL;

        return this._scriptLoader.loadScript(`${url}?v=${provider}`).then(() => {
            if (!this._window.Cardinal) {
                throw new PaymentMethodClientUnavailableError();
            }

            return this._window.Cardinal;
        });
    }
}
