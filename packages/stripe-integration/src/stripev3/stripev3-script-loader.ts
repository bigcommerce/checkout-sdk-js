import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeHostWindow, StripeV3Client } from './stripev3';

export default class StripeV3ScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stripeWindow: StripeHostWindow = window,
    ) {}

    load(
        stripePublishableKey: string,
        stripeAccount: string,
        locale?: string,
    ): Promise<StripeV3Client> {
        return this.scriptLoader.loadScript('https://js.stripe.com/v3/').then(() => {
            if (!this.stripeWindow.Stripe) {
                throw new PaymentMethodClientUnavailableError();
            }

            return this.stripeWindow.Stripe(stripePublishableKey, {
                stripeAccount,
                locale,
                betas: ['payment_intent_beta_3', 'alipay_pm_beta_1'],
                apiVersion: '2020-03-02;alipay_beta=v1',
            });
        });
    }
}
