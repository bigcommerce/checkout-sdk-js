import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    StripeInitializationData,
    StripeCheckoutSessionClient,
    StripeCheckoutElements,
    StripeCheckoutSessionHostWindow,
} from '@bigcommerce/checkout-sdk/stripe-utils';
import { StripeCheckoutElementsOptions } from 'packages/stripe-utils/src/stripe';



export default class StripeCSScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stripeWindow: StripeCheckoutSessionHostWindow = window,
    ) {}

    async getStripeClient(
        initializationData: StripeInitializationData,
        locale?: string,
        betas?: string[],
        apiVersion?: string,
    ): Promise<StripeCheckoutSessionClient> {
        if (this.stripeWindow.bcStripeCheckoutClient) {
            return this.stripeWindow.bcStripeCheckoutClient;
        }

        const stripe = await this.load();
        const { stripePublishableKey, stripeConnectedAccount } = initializationData;
        const options = {
            ...(stripeConnectedAccount ? { stripeAccount: stripeConnectedAccount } : {}),
            ...(locale ? { locale } : {}),
            ...(betas ? { betas } : {}),
            ...(apiVersion ? { apiVersion } : {}),
        };

        const stripeClient = stripe<StripeCheckoutSessionClient>(stripePublishableKey, options);

        Object.assign(this.stripeWindow, { bcStripeCheckoutClient: stripeClient });

        return stripeClient;
    }

    async getElements(
        stripeClient: StripeCheckoutSessionClient,
        options: StripeCheckoutElementsOptions,
    ): Promise<StripeCheckoutElements> {
        let stripeElements = this.stripeWindow.bcStripeCheckoutElements;

        if (!stripeElements) {
            stripeElements = await stripeClient.initCheckout(options);
            // const loadActionsResult = await stripeClient.loadActions();
            // console.log('*** loadActionsResult', loadActionsResult);


            Object.assign(this.stripeWindow, { bcStripeCheckoutElements: stripeElements });
        } else {
            // await this.updateStripeElements(options);
        }

        return stripeElements;
    }

    async updateStripeElements(options: StripeCheckoutElementsOptions) {
        const stripeElements = this.stripeWindow.bcStripeCheckoutElements;

        if (!stripeElements) {
            return;
        }

        stripeElements.update(options);
        await stripeElements.fetchUpdates();
    }

    private async load() {
        console.log('loading stripe');
        if (!this.stripeWindow.Stripe) {
            await this.scriptLoader.loadScript('https://js.stripe.com/basil/stripe.js');

            if (!this.stripeWindow.Stripe) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.stripeWindow.Stripe;
    }
}
