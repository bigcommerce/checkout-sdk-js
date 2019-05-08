import {ScriptLoader} from '@bigcommerce/script-loader';

import StandardError from '../../../common/error/errors/standard-error';

import {CardinalWindow, CyberSourceCardinal} from './cybersource';

const SDK_TEST_URL = 'https://includestest.ccdc02.com/cardinalcruise/v1/songbird.js';
const SDK_PROD_URL = 'https://songbird.cardinalcommerce.com/edge/v1/songbird.js';

export default class CyberSourceScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: CardinalWindow = window
    ) {}

    load(testMode?: boolean): Promise<CyberSourceCardinal> {
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
