import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccountCreator,
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostWindow,
    BraintreePaypalCheckoutCreator,
} from './braintree';

const VERSION = '3.81.0';

export default class BraintreeScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async loadClient(): Promise<BraintreeClientCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${VERSION}/js/client.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.client) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.client;
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${VERSION}/js/paypal-checkout.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.paypalCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.paypalCheckout;
    }

    async loadBraintreeLocalMethods() {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${VERSION}/js/local-payment.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.localPayment) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.localPayment;
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${VERSION}/js/data-collector.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.dataCollector) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.dataCollector;
    }

    async loadUsBankAccount(): Promise<BraintreeBankAccountCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${VERSION}/js/us-bank-account.min.js`,
        );

        if (
            !this.braintreeHostWindow.braintree ||
            !this.braintreeHostWindow.braintree.usBankAccount
        ) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.usBankAccount;
    }
}
