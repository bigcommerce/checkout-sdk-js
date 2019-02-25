import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { StripeHostWindow, StripeV3Client } from './stripev3';

export default class StripeV3ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: StripeHostWindow = window
    ) {}

    load(publishableKey: string): Promise<StripeV3Client> {
        return this._scriptLoader
            .loadScript('https://js.stripe.com/v3/')
            .then(() => {
                if (!this._window.Stripe) {
                    throw new StandardError();
                }

                return this._window.Stripe(publishableKey, {
                    betas: ['payment_intent_beta_3'],
                });
            });
    }
}
