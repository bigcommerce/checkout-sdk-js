/// <reference path="./afterpay-sdk.d.ts" />

import { ScriptLoader } from '@bigcommerce/script-loader';
import { PaymentMethod } from '../../../payment';

const SCRIPT_PROD = '//www.secure-afterpay.com.au/afterpay-async.js';
const SCRIPT_SANDBOX = '//www-sandbox.secure-afterpay.com.au/afterpay-async.js';

/** Class responsible for loading the Afterpay SDK */
export default class AfterpayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     * @param method the payment method data
     */
    load(method: PaymentMethod): Promise<Afterpay.Sdk> {
        const testMode = method.config.testMode;
        const scriptURI = testMode ? SCRIPT_SANDBOX : SCRIPT_PROD;

        return this._scriptLoader.loadScript(scriptURI)
            .then(() => (window as any).AfterPay as Afterpay.Sdk);
    }
}
