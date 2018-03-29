/// <reference path="./klarna-sdk.d.ts" />

import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethod } from '../../../payment';

const SDK_URL = '//credit.klarnacdn.net/lib/v1/api.js';

export default class KlarnaScriptLoader {
    private _loadPromise?: Promise<Klarna.Sdk>;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    load(): Promise<Klarna.Sdk> {
        const windowObject = (window as any);

        if (!this._loadPromise) {
            this._loadPromise = this._scriptLoader.loadScript(SDK_URL)
                .then(() => windowObject.Klarna && windowObject.Klarna.Credit)
                .catch(() => { this._loadPromise = undefined; });
        }

        return this._loadPromise;
    }
}
