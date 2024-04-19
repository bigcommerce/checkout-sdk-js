import { ScriptLoader } from '@bigcommerce/script-loader';

import assertSquareV2Window from './is-squarev2-window';
import { Square } from './types';

export enum SquareV2WebPaymentsSdkEnv {
    LIVE = 'https://web.squarecdn.com/v1/square.js',
    SANDBOX = 'https://sandbox.web.squarecdn.com/v1/square.js',
}

export default class SquareV2ScriptLoader {
    constructor(private _scriptLoader: ScriptLoader) {}

    async load(testMode = false): Promise<Square> {
        await this._scriptLoader.loadScript(
            testMode ? SquareV2WebPaymentsSdkEnv.SANDBOX : SquareV2WebPaymentsSdkEnv.LIVE,
        );

        assertSquareV2Window(window);

        return window.Square;
    }
}
