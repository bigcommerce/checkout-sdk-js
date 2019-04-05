import { ScriptLoader } from '@bigcommerce/script-loader';

import {StandardError} from '../../../common/error/errors';

import { StripeHostWindow } from './stripe';

export default class StripeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: StripeHostWindow = window
    ) {}

    load(stripePublishableKey: string): Promise<any> {
        return this._scriptLoader
            .loadScript('https://js.stripe.com/v3/')
            .then(() => {
                if (!this._window.Stripe) {
                    throw new StandardError();
                }

                return this._window.Stripe('pk_test_OiGqP4ZezFBTJErOWeMFumjE', {
                    betas: ['payment_intent_beta_3'],
                });
            });
    }
}
