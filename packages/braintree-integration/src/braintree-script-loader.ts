import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccountCreator,
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalCheckoutCreator,
} from './braintree';

const BraintreeSdkVersionStable = '3.95.0';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion = BraintreeSdkVersionStable;

    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    // TODO: this method is needed only for braintree AXO
    // So can be removed after Beta state
    initialize({ isAcceleratedCheckoutEnabled }: BraintreeInitializationData) {
        this.braintreeSdkVersion = isAcceleratedCheckoutEnabled
            ? '3.95.0-connect-alpha.7'
            : BraintreeSdkVersionStable;
    }

    async loadClient(): Promise<BraintreeClientCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/client.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.client) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.client;
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/paypal-checkout.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.paypalCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.paypalCheckout;
    }

    async loadBraintreeLocalMethods() {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/local-payment.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.localPayment) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.localPayment;
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/data-collector.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.dataCollector) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.dataCollector;
    }

    async loadUsBankAccount(): Promise<BraintreeBankAccountCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/us-bank-account.min.js`,
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
