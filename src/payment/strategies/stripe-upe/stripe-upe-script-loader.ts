import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { StripeHostWindow, StripeUPEClient } from './stripe-upe';

export default class StripeUPEScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: StripeHostWindow = window
    ) {}

    async load(stripePublishableKey: string, stripeAccount: string, locale?: string): Promise<StripeUPEClient> {
        await this._scriptLoader.loadScript('https://js.stripe.com/v3/');

        if (!this._window.Stripe) {
          throw new PaymentMethodClientUnavailableError();
        }

        return this._window.Stripe(stripePublishableKey, {
          stripeAccount,
          locale,
          betas: ['payment_element_beta_2', 'alipay_pm_beta_1'],
          apiVersion: '2020-03-02;alipay_beta=v1',
        });
    }

}
