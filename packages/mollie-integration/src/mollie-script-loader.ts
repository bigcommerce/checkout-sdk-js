import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { MollieClient, MollieHostWindow } from './mollie';

export default class MollieScriptLoader {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(private scriptLoader: ScriptLoader, private _window: Window = window) {}

    isMollieWindow(window: Window): window is MollieHostWindow {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const mollieWindow: MollieHostWindow = window as MollieHostWindow;

        return !!mollieWindow.Mollie;
    }

    async load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient> {
        await this.scriptLoader.loadScript('https://js.mollie.com/v1/mollie.js');

        if (!this.isMollieWindow(this._window)) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.Mollie(merchantId, {
            locale,
            testmode,
        });
    }
}
