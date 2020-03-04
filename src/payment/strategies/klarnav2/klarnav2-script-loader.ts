import { ScriptLoader } from '@bigcommerce/script-loader';

import KlarnaPayments from './klarna-payments';
import KlarnaV2Window from './klarnav2-window';

const SDK_URL = 'https://x.klarnacdn.net/kp/lib/v1/api.js';

export default class KlarnaV2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    load(): Promise<KlarnaPayments> {
        return this._scriptLoader.loadScript(SDK_URL)
            .then(() => (window as unknown as KlarnaV2Window).Klarna.Payments);
    }
}
