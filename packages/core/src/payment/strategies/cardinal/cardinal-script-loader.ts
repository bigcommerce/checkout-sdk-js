import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { CardinalSDK, CardinalWindow } from './cardinal';

const SDK_TEST_URL = 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js';
const SDK_PROD_URL = 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js';

export default class CardinalScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: CardinalWindow = window
    ) {}

    load(provider: string, testMode?: boolean): Promise<CardinalSDK> {
        const url = testMode ? SDK_TEST_URL : SDK_PROD_URL;

        return this._scriptLoader
            .loadScript(url + '?v=' + provider)
            .then(() => {
                if (!this._window.Cardinal) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.Cardinal;
            });
    }
}
