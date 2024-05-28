import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import {
    InvalidArgumentError,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BoltCheckout,
    BoltDeveloperMode,
    BoltDeveloperModeParams,
    BoltEmbedded,
    BoltHostWindow,
} from './bolt';

export default class BoltScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        public boltHostWindow: BoltHostWindow = window,
    ) {}

    async loadBoltClient(
        publishableKey?: string,
        testMode?: boolean,
        developerModeParams?: BoltDeveloperModeParams,
        cartId?: string,
        storefrontApiToken?: string,
    ): Promise<BoltCheckout> {
        if (this.boltHostWindow.BoltCheckout) {
            return this.boltHostWindow.BoltCheckout;
        }

        if (!publishableKey) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "publishableKey" argument is not provided.',
            );
        }

        await this.scriptLoader.loadScript(
            `//${this.getDomainURL(!!testMode, developerModeParams)}/connect-bigcommerce.js`,
            this.getScriptOptions('bolt-connect', publishableKey, cartId, storefrontApiToken),
        );
        await this.scriptLoader.loadScript(
            `//${this.getDomainURL(!!testMode, developerModeParams)}/track.js`,
            this.getScriptOptions('bolt-track', publishableKey),
        );

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.boltHostWindow.BoltCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.boltHostWindow.BoltCheckout;
    }

    async loadBoltEmbedded(
        publishableKey: string,
        testMode?: boolean,
        developerModeParams?: BoltDeveloperModeParams,
    ): Promise<BoltEmbedded> {
        const options: LoadScriptOptions = {
            async: true,
            attributes: {
                id: 'bolt-embedded',
            },
        };

        await this.scriptLoader.loadScript(
            `//${this.getDomainURL(!!testMode, developerModeParams)}/embed.js`,
            options,
        );

        if (!this.boltHostWindow.Bolt) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.boltHostWindow.Bolt(publishableKey);
    }

    getDomainURL(testMode: boolean, developerModeParams?: BoltDeveloperModeParams): string {
        if (!testMode) {
            return 'connect.bolt.com';
        }

        if (developerModeParams) {
            switch (developerModeParams.developerMode) {
                case BoltDeveloperMode.StagingMode:
                    return 'connect-staging.bolt.com';

                case BoltDeveloperMode.DevelopmentMode:
                    return `connect.${developerModeParams.developerDomain}`;
            }
        }

        return 'connect-sandbox.bolt.com';
    }

    private getScriptOptions(
        id: string,
        publishableKey: string,
        cartId?: string,
        storefrontApiToken?: string,
    ): LoadScriptOptions {
        return {
            async: true,
            attributes: {
                id,
                'data-publishable-key': publishableKey,
                ...(cartId && { 'data-shopping-cart-id': cartId }),
                ...(storefrontApiToken && { 'data-storefront-api-token': storefrontApiToken }),
            },
        };
    }
}
