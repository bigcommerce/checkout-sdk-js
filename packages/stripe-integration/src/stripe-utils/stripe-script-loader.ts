import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeClient,
    StripeConfigurationOptions,
    StripeElements,
    StripeElementsOptions,
    StripeHostWindow,
} from './stripe';

export default class StripeScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stripeWindow: StripeHostWindow = window,
    ) {}

    async getStripeClient(
        stripePublishableKey: string,
        stripeAccount?: string,
        locale?: string,
        options?: StripeConfigurationOptions,
    ): Promise<StripeClient> {
        let stripeClient = this.stripeWindow.bcStripeClient;

        if (!stripeClient) {
            const stripe = await this.load();
            const defaultOptions = {
                stripeAccount,
                locale,
                // TODO: move this options to Stripe UPE components
                betas: [
                    'payment_element_beta_2',
                    'alipay_pm_beta_1',
                    'link_default_integration_beta_1',
                    'shipping_address_element_beta_1',
                    'address_element_beta_1',
                ],
                apiVersion: '2020-03-02;alipay_beta=v1;link_beta=v1',
            };

            stripeClient = stripe<StripeClient>(stripePublishableKey, options || defaultOptions);

            Object.assign(this.stripeWindow, { bcStripeClient: stripeClient });
        }

        return stripeClient;
    }

    async getElements(
        stripeClient: StripeClient,
        options: StripeElementsOptions,
    ): Promise<StripeElements> {
        let stripeElements = this.stripeWindow.bcStripeElements;

        if (!stripeElements) {
            stripeElements = stripeClient.elements(options);

            Object.assign(this.stripeWindow, { bcStripeElements: stripeElements });
        } else {
            await this.updateStripeElements(options);
        }

        return stripeElements;
    }

    async updateStripeElements(options: StripeElementsOptions) {
        const stripeElements = this.stripeWindow.bcStripeElements;

        if (!stripeElements) {
            return;
        }

        stripeElements.update(options);
        await stripeElements.fetchUpdates();
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
