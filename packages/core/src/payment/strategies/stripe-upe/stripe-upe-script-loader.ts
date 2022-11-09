import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import {
    StripeElements,
    StripeElementsOptions,
    StripeHostWindow,
    StripeUPEClient,
} from './stripe-upe';

export default class StripeUPEScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, private _window: StripeHostWindow = window) {}

    async getStripeClient(
        stripePublishableKey: string,
        stripeAccount: string,
        locale?: string,
    ): Promise<StripeUPEClient> {
        let stripeClient = this._window.bcStripeClient;

        if (!stripeClient) {
            const stripe = await this.load();

            stripeClient = stripe(stripePublishableKey, {
                stripeAccount,
                locale,
                betas: [
                    'payment_element_beta_2',
                    'alipay_pm_beta_1',
                    'link_default_integration_beta_1',
                    'shipping_address_element_beta_1',
                    'address_element_beta_1',
                ],
                apiVersion: '2020-03-02;alipay_beta=v1;link_beta=v1',
            });

            Object.assign(this._window, { bcStripeClient: stripeClient });
        }

        return stripeClient;
    }

    getElements(stripeClient: StripeUPEClient, options: StripeElementsOptions): StripeElements {
        let stripeElements = this._window.bcStripeElements;

        if (!stripeElements) {
            stripeElements = stripeClient.elements(options);

            Object.assign(this._window, { bcStripeElements: stripeElements });
        } else {
            stripeElements.fetchUpdates();
            stripeElements.update(options);
        }

        return stripeElements;
    }

    private async load() {
        await this._scriptLoader.loadScript('https://js.stripe.com/v3/');

        if (!this._window.Stripe) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.Stripe;
    }
}
