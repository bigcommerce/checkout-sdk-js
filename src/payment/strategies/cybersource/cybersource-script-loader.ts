import {ScriptLoader} from '@bigcommerce/script-loader';

import StandardError from '../../../common/error/errors/standard-error';

import {CardinalWindow, CyberSourceCardinal} from './cybersource';

const SDK_TEST_URL = '';
const SDK_PROD_URL = '';

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
