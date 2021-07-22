import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { SquareFormOptions } from './square-form';
import SquareWindow from './square-window';

export default class SquareScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: Window = window
    ) {}

    _isSquareWindow(window: Window): window is SquareWindow {
        const squareWindow: SquareWindow = window as SquareWindow;

        return !!squareWindow.SqPaymentForm;
    }

    async load(): Promise<any> {
        await this._scriptLoader.loadScript('//js.squareup.com/v2/paymentform');

        return (options: SquareFormOptions) => {
            if (!this._isSquareWindow(this._window)) {
                throw new PaymentMethodClientUnavailableError();
            }

            return new this._window.SqPaymentForm(options);
        };
    }
}
