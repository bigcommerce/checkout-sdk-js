import { ScriptLoader } from '@bigcommerce/script-loader';

import PaymentMethod from '../../payment-method';

import AfterpaySdk from './afterpay-sdk';
import AfterpayWindow from './afterpay-window';

interface AfterpayScripts {
    PROD: string;
    SANDBOX: string;
}

const SCRIPTS_DEFAULT: AfterpayScripts = {
    PROD: '//portal.afterpay.com/afterpay-async.js',
    SANDBOX: '//portal-sandbox.afterpay.com/afterpay-async.js',
};

const SCRIPTS_US: AfterpayScripts = {
    PROD: '//portal.afterpay.com/afterpay-async.js',
    SANDBOX: '//portal.us-sandbox.afterpay.com/afterpay-async.js',
};

/** Class responsible for loading the Afterpay SDK */
export default class AfterpayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     * @param method the payment method data
     */
    load(method: PaymentMethod, countryCode: string): Promise<AfterpaySdk> {
        const testMode = method.config.testMode || false;
        const scriptURI = this._getScriptURI(countryCode, testMode);

        return this._scriptLoader.loadScript(scriptURI)
            .then(() => (window as unknown as AfterpayWindow).AfterPay);
    }

    private _getScriptURI(countryCode: string, testMode: boolean): string {
        if (countryCode === 'US') {
            return testMode ? SCRIPTS_US.SANDBOX : SCRIPTS_US.PROD;
        }

        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }

}
