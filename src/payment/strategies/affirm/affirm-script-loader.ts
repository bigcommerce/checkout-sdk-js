import { PaymentMethodClientUnavailableError } from '../../errors';

import { Affirm, AffirmHostWindow, AffirmScripts } from './affirm';
import loadAffirmJS from './affirmJs';

export default class AffirmScriptLoader {
    constructor(
        public _window: AffirmHostWindow = window
    ) { }

    load(apikey?: string, testMode?: boolean): Promise<Affirm> {
        const scriptURI = this._getScriptURI(testMode);

        loadAffirmJS(apikey, scriptURI);

        if (!this._window.affirm) {
            throw new PaymentMethodClientUnavailableError();
        }

        return Promise.resolve(this._window.affirm);
    }

    private _getScriptURI(testMode: boolean = false): string {
        const SCRIPTS_DEFAULT: AffirmScripts = {
            PROD: '//cdn1.affirm.com/js/v2/affirm.js',
            SANDBOX: '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
        };

        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }
}
