import { ScriptLoader } from '@bigcommerce/script-loader';

import {StandardError} from '../../../common/error/errors';

import { StripeHostWindow, StripeSDK } from './stripe';

export default class StripeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: StripeHostWindow = window
    ) {}

    load(): Promise<StripeSDK> {
        return this._scriptLoader
            .loadScript('https://js.stripe.com/v2/')
            .then(() => {
                if (!this._window.Stripe) {
                    throw new StandardError();
                }

                this._window.Stripe.setPublishableKey('pk_test_wqcu0YROyYkKB30ZAq5XrnCz');

                return this._window.Stripe;
            });
    }
}
