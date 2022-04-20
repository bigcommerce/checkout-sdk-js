import { ScriptLoader } from '@bigcommerce/script-loader';

import KlarnaCredit from './klarna-credit';
import KlarnaWindow from './klarna-window';

const SDK_URL = '//credit.klarnacdn.net/lib/v1/api.js';

export default class KlarnaScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    load(): Promise<KlarnaCredit> {
        return this._scriptLoader.loadScript(SDK_URL)
            .then(() => (window as unknown as KlarnaWindow).Klarna.Credit);
    }
}
