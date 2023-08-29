import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import isMollieWindow from './is-mollie-window';
import { MollieClient } from './mollie';

export default class MollieScriptLoader {
    constructor(private scriptLoader: ScriptLoader, private mollieHostWindow: Window = window) {}

    async load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient> {
        await this.scriptLoader.loadScript('https://js.mollie.com/v1/mollie.js');

        if (!isMollieWindow(this.mollieHostWindow)) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.mollieHostWindow.Mollie(merchantId, {
            locale,
            testmode,
        });
    }
}
