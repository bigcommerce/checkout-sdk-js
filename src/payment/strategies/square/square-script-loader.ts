import { ScriptLoader } from '@bigcommerce/script-loader';

import { SquareFormFactory, SquareFormOptions } from './square-form';
import SquareWindow from './square-window';

export default class SquareScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    load(): Promise<SquareFormFactory> {
        const scriptURI = '//js.squareup.com/v2/paymentform';

        return this._scriptLoader.loadScript(scriptURI)
            .then(() => (options: SquareFormOptions) =>
                new (window as unknown as SquareWindow).SqPaymentForm(options)
            );
    }
}
