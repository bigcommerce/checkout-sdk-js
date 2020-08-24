import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { ConvergeHostWindow, ConvergeSDK } from './converge';

const libUrl = 'https://libs.fraud.elavon.com/sdk-web-js/0.12.0/3ds2-web-sdk.min.js';
const sdk3DS2 = 'https://uat.gw.fraud.eu.elavonaws.com/sdk-web-js/0.13.2/3ds2-web-sdk.min.js';
const baseUrl = 'https://uat.gw.fraud.eu.elavonaws.com/3ds2';

export default class ConvergeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: ConvergeHostWindow = window
    ) {}

    async load(token?: string): Promise<ConvergeSDK> {
        await Promise.all([
            this._scriptLoader.loadScript(sdk3DS2),
            this._scriptLoader.loadScript(libUrl),
        ]);

        if (!this._window.Elavon3DSWebSDK) {
            throw new PaymentMethodClientUnavailableError();
        }

        return new this._window.Elavon3DSWebSDK({baseUrl, token});
    }
}
