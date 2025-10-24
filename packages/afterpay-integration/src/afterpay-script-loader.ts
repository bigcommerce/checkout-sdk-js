import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import AfterpaySdk from './afterpay-sdk';
import isAfterpayWindow from './is-afterpay-window';

enum SCRIPTS_DEFAULT {
    PROD = '//portal.afterpay.com/afterpay-async.js',
    SANDBOX = '//portal.sandbox.afterpay.com/afterpay.js',
}

enum SCRIPTS_US {
    PROD = '//portal.afterpay.com/afterpay-async.js',
    SANDBOX = '//portal.sandbox.afterpay.com/afterpay.js',
}

/** Class responsible for loading the Afterpay SDK */
export default class AfterpayScriptLoader {
    constructor(private _scriptLoader: ScriptLoader) {}

    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     *
     * @param {PaymentMethod} method the payment method data
     */
    async load(method: PaymentMethod, countryCode: string): Promise<AfterpaySdk> {
        const testMode = method.config.testMode || false;
        const scriptURI = this._getScriptURI(countryCode, testMode);

        return this._scriptLoader.loadScript(scriptURI).then(() => {
            if (!isAfterpayWindow(window)) {
                throw new PaymentMethodClientUnavailableError();
            }

            return window.AfterPay;
        });
    }

    private _getScriptURI(countryCode: string, testMode: boolean): string {
        if (countryCode === 'US') {
            return testMode ? SCRIPTS_US.SANDBOX : SCRIPTS_US.PROD;
        }

        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }
}
