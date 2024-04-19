import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { CBAMPGSHostWindow, ThreeDSjs } from './cba-mpgs';

export default class CBAMPGSScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, private _window: CBAMPGSHostWindow = window) {}

    async load(testMode?: boolean): Promise<ThreeDSjs> {
        await this._scriptLoader.loadScript(
            `//${
                testMode ? 'test' : 'ap'
            }-gateway.mastercard.com/static/threeDS/1.3.0/three-ds.min.js`,
        );

        if (!this._window.ThreeDS) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.ThreeDS;
    }
}
