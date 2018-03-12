/// <reference path="./square-form.d.ts" />

import { ScriptLoader } from '@bigcommerce/script-loader';

export default class SquareScriptLoader {
    private _loadPromise?: Promise<Square.FormFactory>;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    load(): Promise<Square.FormFactory> {
        const scriptURI = '//js.squareup.com/v2/paymentform';

        if (!this._loadPromise) {
            this._loadPromise = this._scriptLoader.loadScript(scriptURI)
                .then(() => (options: Square.FormOptions) =>
                    new (window as Square.HostWindow).SqPaymentForm(options)
                );
        }

        return this._loadPromise;
    }
}
