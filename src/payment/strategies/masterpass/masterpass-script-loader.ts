import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { Masterpass, MasterpassHostWindow } from './masterpass';

export default class MasterpassScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: MasterpassHostWindow = window
    ) {}

    load(testMode?: boolean, locale?: string, checkoutId?: string): Promise<Masterpass> {
        return this._scriptLoader
            .loadScript(`https://${testMode ? 'sandbox.' : ''}src.mastercard.com/srci/integration/merchant.js?locale=${locale}&checkoutid=${checkoutId}`)
            .then(() => {
                if (!this._window.masterpass) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.masterpass;
            });
    }
}
