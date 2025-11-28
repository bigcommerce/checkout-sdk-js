import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import ClearpaySdk from './clearpay-sdk';
import ClearpayWindow from './clearpay-window';

const SCRIPTS_DEFAULT = {
    PROD: '//portal.clearpay.co.uk/afterpay-async.js',
    SANDBOX: '//portal.sandbox.clearpay.co.uk/afterpay-async.js',
    HTTPS_SANDBOX: 'https://portal.sandbox.clearpay.co.uk/afterpay-async.js',
    HTTPS_PROD: 'https://portal.clearpay.co.uk/afterpay-async.js',
};

const CLEARPAY_HTTPS_PROD_SCRIPT_EXPERIMENT = 'PI-4555.clearpay_add_https_to_prod_script';

export default class ClearpayScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, public _window: ClearpayWindow = window) {}

    async load(method: PaymentMethod, features = {}): Promise<ClearpaySdk> {
        await this._scriptLoader.loadScript(this._getScriptUrl(method.config.testMode, features));

        if (!this._window.AfterPay) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.AfterPay;
    }

    private _getScriptUrl(testMode?: boolean, features = {}): string {
        const httpsEnabled = isExperimentEnabled(
            features,
            CLEARPAY_HTTPS_PROD_SCRIPT_EXPERIMENT,
            false,
        );

        if (testMode) {
            return httpsEnabled ? SCRIPTS_DEFAULT.HTTPS_SANDBOX : SCRIPTS_DEFAULT.SANDBOX;
        }

        return httpsEnabled ? SCRIPTS_DEFAULT.HTTPS_PROD : SCRIPTS_DEFAULT.PROD;
    }
}
