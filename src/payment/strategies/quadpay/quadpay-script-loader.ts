import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import { Quadpay, QuadpayHostWindow } from '../quadpay';

export default class QuadpayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: QuadpayHostWindow = window
    ) {}

    load(): Promise<Quadpay> {
        return this._scriptLoader
            .loadScript(`//static.zipmoney.com.au/checkout/checkout-v1.min.js`)
            .then(() => {
                if (!this._window.Quadpay) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.Quadpay;
            });
    }
}
