import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { CardinalSDK, CardinalWindow } from './cardinal';

const SDK_TEST_URL = 'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js';
const SDK_PROD_URL = 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js';

export default class CardinalScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: CardinalWindow = window
    ) {}

    load(testMode?: boolean): Promise<CardinalSDK> {
        return this._scriptLoader
            .loadScript(testMode ? SDK_TEST_URL : SDK_PROD_URL)
            .then(() => {
                if (!this._window.Cardinal) {
                    throw new StandardError();
                }

                return this._window.Cardinal;
            });
    }
}
