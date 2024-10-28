import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeElements,
    StripeElementsOptions,
    StripeHostWindow,
    StripeUPEClient,
} from './stripe-upe';

export default class StripeUPEScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stripeWindow: StripeHostWindow = window,
    ) {}

    async getStripeClient(
        stripePublishableKey: string,
        stripeAccount: string,
        locale?: string,
    ): Promise<StripeUPEClient> {
        let stripeClient = this.stripeWindow.bcStripeClient;

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

            Object.assign(this.stripeWindow, { bcStripeClient: stripeClient });
        }

        return stripeClient;
    }

    async getStripeLinkV2Client(
        stripePublishableKey: string,
    ): Promise<StripeUPEClient> {
        let stripeClient = this.stripeWindow.bcStripeClient;

        if (!stripeClient) {
            const stripe = await this.load();
            stripeClient = stripe(stripePublishableKey);

            Object.assign(this.stripeWindow, { bcStripeClient: stripeClient });
        }

        return stripeClient;
    }

    async getElements(
        stripeClient: StripeUPEClient,
        options: StripeElementsOptions,
    ): Promise<StripeElements> {
        let stripeElements = this.stripeWindow.bcStripeElements;

        if (!stripeElements) {
            stripeElements = stripeClient.elements(options);

            Object.assign(this.stripeWindow, { bcStripeElements: stripeElements });
        } else {
            stripeElements.update(options);
            await stripeElements.fetchUpdates();
        }

        return stripeElements;
    }

    private async load() {
        if (!this.stripeWindow.Stripe) {
            await this.scriptLoader.loadScript('https://js.stripe.com/v3/');

            if (!this.stripeWindow.Stripe) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.stripeWindow.Stripe;
    }
}
