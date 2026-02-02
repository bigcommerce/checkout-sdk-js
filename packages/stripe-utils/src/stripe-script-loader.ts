import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeCheckoutSession,
    StripeClient,
    StripeElements,
    StripeElementsOptions,
    StripeHostWindow,
    StripeInitCheckoutOptions,
    StripeInitializationData,
    StripeJsVersion,
} from './stripe';

export default class StripeScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private stripeWindow: StripeHostWindow = window,
    ) {}

    async getStripeClient(
        initializationData: StripeInitializationData,
        locale?: string,
        stripeJsVersion?: string,
        betas?: string[],
        apiVersion?: string,
    ): Promise<StripeClient> {
        if (this.stripeWindow.bcStripeClient) {
            return this.stripeWindow.bcStripeClient;
        }

        const stripe = await this.load(stripeJsVersion);
        const { stripePublishableKey, stripeConnectedAccount } = initializationData;
        const options = {
            ...(stripeConnectedAccount ? { stripeAccount: stripeConnectedAccount } : {}),
            ...(locale ? { locale } : {}),
            ...(betas ? { betas } : {}),
            ...(apiVersion ? { apiVersion } : {}),
        };

        const stripeClient = stripe<StripeClient>(stripePublishableKey, options);

        Object.assign(this.stripeWindow, { bcStripeClient: stripeClient });

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

    async getCheckoutSession(
        stripeClient: StripeClient,
        options: StripeInitCheckoutOptions,
    ): Promise<StripeCheckoutSession> {
        let stripeCheckoutSession = this.stripeWindow.bcStripeCheckoutSession;

        if (!stripeCheckoutSession) {
            stripeCheckoutSession = await stripeClient.initCheckout(options);

            Object.assign(this.stripeWindow, { bcStripeCheckoutSession: stripeCheckoutSession });
        }

        return stripeCheckoutSession;
    }

    private async load(stripeJsVersion?: string) {
        if (!this.stripeWindow.Stripe) {
            await this.scriptLoader.loadScript(this.getScriptUrl(stripeJsVersion));

            if (!this.stripeWindow.Stripe) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.stripeWindow.Stripe;
    }

    private getScriptUrl(stripeJsVersion?: string) {
        if (!stripeJsVersion || stripeJsVersion === StripeJsVersion.V3) {
            return 'https://js.stripe.com/v3/';
        }

        return `https://js.stripe.com/${stripeJsVersion}/stripe.js`;
    }
}
