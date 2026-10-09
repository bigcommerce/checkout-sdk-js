import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeCheckoutInstance,
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

        const stripeClient = stripe(stripePublishableKey, options);

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

    async getStripeCheckout(
        stripeClient: StripeClient,
        options: StripeInitCheckoutOptions,
    ): Promise<StripeCheckoutInstance> {
        let stripeCheckout = await this.getStoredStripeCheckout(options);

        if (!stripeCheckout) {
            stripeCheckout = await stripeClient.initCheckout(options);

            Object.assign(this.stripeWindow, { bcStripeCheckout: stripeCheckout });
        } else {
            const { actions } = await stripeCheckout.loadActions();

            await actions?.runServerUpdate(() => Promise.resolve());
        }

        return stripeCheckout;
    }

    private async load(stripeJsVersion?: string) {
        if (!this.isRequestedStripeJsLoaded(stripeJsVersion)) {
            await this.scriptLoader.loadScript(this.getScriptUrl(stripeJsVersion));

            if (!this.stripeWindow.Stripe) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.stripeWindow.Stripe;
    }

    /**
     * A `window.Stripe` can already exist because another script on the page
     * loaded Stripe.js first, and it is not necessarily the release train this
     * strategy asked for. Reusing it regardless means an explicit version
     * request is silently ignored, and the strategy then calls APIs that the
     * other train may have changed or removed.
     *
     * Stripe.js reports its own train on `Stripe.version`. When that does not
     * match, load the requested bundle so the strategy gets the API it expects.
     */
    private isRequestedStripeJsLoaded(stripeJsVersion?: string): boolean {
        const stripe = this.stripeWindow.Stripe;

        if (!stripe) {
            return false;
        }

        const requestedVersion = stripeJsVersion || StripeJsVersion.V3;
        const loadedVersion = stripe.version;

        // A bundle that reports no version at all predates this property, so
        // there is nothing to compare against. Keep the previous behaviour of
        // reusing it rather than loading a second copy of Stripe.js.
        if (loadedVersion === undefined) {
            return true;
        }

        // A named train reports its codename; the legacy '/v3/' bundle
        // reports the number 3.
        const loadedTrain = typeof loadedVersion === 'number' ? StripeJsVersion.V3 : loadedVersion;

        return loadedTrain === requestedVersion;
    }

    private getScriptUrl(stripeJsVersion?: string) {
        if (!stripeJsVersion || stripeJsVersion === StripeJsVersion.V3) {
            return 'https://js.stripe.com/v3/';
        }

        return `https://js.stripe.com/${stripeJsVersion}/stripe.js`;
    }

    private async getStoredStripeCheckout(
        options: StripeInitCheckoutOptions,
    ): Promise<StripeCheckoutInstance | undefined> {
        const stripeCheckout = this.stripeWindow.bcStripeCheckout;

        if (!stripeCheckout) {
            return undefined;
        }

        try {
            const { actions, error } = await stripeCheckout.loadActions();

            if (error || !actions) {
                this.logErrorToConsole(error);

                return undefined;
            }

            const stripeCheckoutSession = await actions.getSession();
            const stripeSessionIdFromOptions = options.clientSecret.split('_secret_')[0];

            if (stripeCheckoutSession.id === stripeSessionIdFromOptions) {
                return stripeCheckout;
            }
        } catch (error) {
            this.logErrorToConsole(error);

            return undefined;
        }

        return undefined;
    }

    private logErrorToConsole(error?: unknown) {
        /* eslint-disable no-console */
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        error
            ? console.error(error)
            : console.error('No stripe checkout actions available on loadActions().');
        /* eslint-enable no-console */
    }
}
