import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentMethod from '../../payment-method';

import ClearpaySdk from './clearpay-sdk';
import ClearpayWindow from './clearpay-window';

const SCRIPTS_DEFAULT = {
    PROD: '//portal.clearpay.co.uk/afterpay-async.js',
    SANDBOX: '//portal.sandbox.clearpay.co.uk/afterpay-async.js',
};

export default class ClearpayScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, public _window: ClearpayWindow = window) {}

    async load(method: PaymentMethod): Promise<ClearpaySdk> {
        await this._scriptLoader.loadScript(this._getScriptUrl(method.config.testMode));

        if (!this._window.AfterPay) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.AfterPay;
    }

    private _getScriptUrl(testMode?: boolean): string {
        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    }
}
