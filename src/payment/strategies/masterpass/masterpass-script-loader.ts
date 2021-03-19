import { ScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { Masterpass, MasterpassHostWindow } from './masterpass';

export default class MasterpassScriptLoader {

    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: MasterpassHostWindow = window
    ) {}

    load(paymentMethod?: PaymentMethod, locale?: string ): Promise<Masterpass> {

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (paymentMethod.initializationData.isMasterpassSrcEnabled) {
            return this._scriptLoader
                .loadScript(`https://${paymentMethod.config.testMode ? 'sandbox.' : ''}src.mastercard.com/srci/integration/merchant.js?locale=${locale}&checkoutid=${paymentMethod.initializationData.checkoutId}`)
                .then(() => {
                    if (!this._window.masterpass) {
                        throw new PaymentMethodClientUnavailableError();
                    }

                    return this._window.masterpass;
                });
        }

        return this._scriptLoader
            .loadScript(`//${paymentMethod.config.testMode ? 'sandbox.' : ''}masterpass.com/integration/merchant.js`)
            .then(() => {
                if (!this._window.masterpass) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.masterpass;
            });
    }
}
