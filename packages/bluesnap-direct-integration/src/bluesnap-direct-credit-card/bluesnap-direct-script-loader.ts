import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapDirectHostWindow, BlueSnapDirectSdk } from '../types';

export enum BlueSnapDirectSdkEnv {
    PRODUCTION = 'https://pay.bluesnap.com/web-sdk/5/bluesnap.js',
    SANDBOX = 'https://sandpay.bluesnap.com/web-sdk/5/bluesnap.js',
}

export default class BlueSnapDirectScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BlueSnapDirectHostWindow = window,
    ) {}

    async load(testMode = false): Promise<BlueSnapDirectSdk> {
        if (this._window.bluesnap) {
            return this._window.bluesnap;
        }

        await this._scriptLoader.loadScript(
            testMode ? BlueSnapDirectSdkEnv.SANDBOX : BlueSnapDirectSdkEnv.PRODUCTION,
        );

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this._window.bluesnap) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.bluesnap;
    }
}
