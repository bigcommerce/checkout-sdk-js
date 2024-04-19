import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import SquarePaymentForm, { SquareFormOptions, SquareScriptCallBack } from './square-form';
import SquareWindow from './square-window';

export default class SquareScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, private _window: Window = window) {}

    _isSquareWindow(window: Window): window is SquareWindow {
        const squareWindow: SquareWindow = window as SquareWindow;

        return !!squareWindow.SqPaymentForm;
    }

    async load(testmode?: boolean): Promise<SquareScriptCallBack> {
        await this._scriptLoader.loadScript(
            testmode
                ? '//js.squareupsandbox.com/v2/paymentform'
                : '//js.squareup.com/v2/paymentform',
        );

        return (options: SquareFormOptions): SquarePaymentForm => {
            if (!this._isSquareWindow(this._window)) {
                throw new PaymentMethodClientUnavailableError();
            }

            return new this._window.SqPaymentForm(options);
        };
    }
}
