import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors/index';

import {
    GooglePayHostWindow,
    GooglePaySDK
} from './googlepay';

export default class GooglePayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: GooglePayHostWindow = window
    ) {}

    load(): Promise<GooglePaySDK> {
        return this._scriptLoader
            .loadScript('https://pay.google.com/gp/p/js/pay.js')
            .then(() => {
                if (!this._window.google) {
                    throw new StandardError();
                }

                return this._window.google;
            });
    }
}
