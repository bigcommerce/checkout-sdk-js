import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AmazonPayV2HostWindow,
    AmazonPayV2InitializeOptions,
    amazonPayV2Regions,
    AmazonPayV2SDK,
} from './amazon-pay-v2';

export default class AmazonPayV2ScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private windowWithAmazonPay: AmazonPayV2HostWindow = window,
    ) {}

    async load(method: PaymentMethod<AmazonPayV2InitializeOptions>): Promise<AmazonPayV2SDK> {
        const { initializationData } = method;
        const region = initializationData?.region || 'us';

        const amazonPayV2Region = amazonPayV2Regions[region];

        await this.scriptLoader.loadScript(
            `https://static-${amazonPayV2Region}.payments-amazon.com/checkout.js`,
        );

        if (!this.windowWithAmazonPay.amazon) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.windowWithAmazonPay.amazon;
    }
}
