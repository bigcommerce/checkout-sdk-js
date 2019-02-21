import { ScriptLoader } from '@bigcommerce/script-loader';

import PaymentMethod from '../../payment-method';

import AffirmSdk from './affirm-sdk';
import AffirmWindow from './affirm-window';

interface AffirmScripts {
    PROD: string;
    SANDBOX: string;
}

const SCRIPTS_DEFAULT: AffirmScripts = {
    PROD: '//cdn1.affirm.com/js/v2/affirm.js',
    SANDBOX: '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
};

/** Class responsible for loading the Afterpay SDK */
export default class AffirmScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     * @param method the payment method data
     */
    load(method: PaymentMethod): Promise<AffirmSdk> {
        const testMode = method.config.testMode || false;
        const scriptURI = this._getScriptURI(testMode);

        return this._scriptLoader.loadScript(scriptURI)
            .then(() => {
                return (window as AffirmWindow).Affirm;
            });
    }

    private _getScriptURI(testMode: boolean): string {
        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }

}
