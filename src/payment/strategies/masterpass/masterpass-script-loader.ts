import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';
import { Masterpass, MasterpassHostWindow } from '../masterpass/masterpass';

export default class MasterpassScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: MasterpassHostWindow = window
    ) {}

    load(testMode?: boolean): Promise<Masterpass> {
        return this._scriptLoader
            .loadScript(`//${testMode ? 'sandbox.' : ''}masterpass.com/integration/merchant.js`)
            .then(() => {
                if (!this._window.masterpass) {
                    throw new StandardError();
                }

                return this._window.masterpass;
            });
    }
}
