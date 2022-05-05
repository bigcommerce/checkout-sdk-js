import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { MollieClient, MollieHostWindow } from './mollie';

export default class MollieScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: Window = window
    ) {
    }

    _isMollieWindow(window: Window): window is MollieHostWindow {
        const mollieWindow: MollieHostWindow = window as MollieHostWindow;

        return !!mollieWindow.Mollie;
    }

    async load(merchantId: string, locale: string, testmode: boolean): Promise<MollieClient> {
        await this._scriptLoader.loadScript('https://js.mollie.com/v1/mollie.js');

        if (!this._isMollieWindow(this._window)) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.Mollie(merchantId, {
            locale,
            testmode,
        });
    }
}
