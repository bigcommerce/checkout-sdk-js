import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeInitializationData,
    HostWindow,
} from './apple-pay';

const BraintreeSdkVersionStable = '3.95.0';

export default class ApplePayScriptLoader {
    private braintreeSdkVersion = BraintreeSdkVersionStable;

    constructor(private scriptLoader: ScriptLoader, private hostWindow: HostWindow) {}

    // TODO: this method is needed only for braintree AXO
    // So can be removed after Beta state
    initialize({ isAcceleratedCheckoutEnabled }: BraintreeInitializationData) {
        this.braintreeSdkVersion = isAcceleratedCheckoutEnabled
            ? '3.95.0-connect-alpha.11'
            : BraintreeSdkVersionStable;
    }

    async loadBraintreeClient(): Promise<BraintreeClientCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/client.min.js`,
        );

        if (!this.hostWindow.braintree?.client) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.hostWindow.braintree.client;
    }

    loadBraintreeDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this.scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/data-collector.min.js`,
            )
            .then(() => {
                if (!this.hostWindow.braintree || !this.hostWindow.braintree.dataCollector) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this.hostWindow.braintree.dataCollector;
            });
    }
}
