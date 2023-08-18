import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { MollieClient, MollieHostWindow } from './mollie';

export default class MollieScriptLoader {
    constructor(private scriptLoader: ScriptLoader, private mollieHostWindow: Window = window) {}

    isMollieWindow(window: Window): window is MollieHostWindow {
        return 'Mollie' in window;
    }

    async load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient> {
        await this.scriptLoader.loadScript('https://js.mollie.com/v1/mollie.js');

        if (!this.isMollieWindow(this.mollieHostWindow)) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.mollieHostWindow.Mollie(merchantId, {
            locale,
            testmode,
        });
    }
}
