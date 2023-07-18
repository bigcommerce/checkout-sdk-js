import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccountCreator,
    BraintreeClientCreator,
    BraintreeConnectCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostWindow,
    BraintreePaypalCheckoutCreator,
} from './braintree';

export default class BraintreeScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    async loadClient(): Promise<BraintreeClientCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/client.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.client) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.client;
    }

    async loadConnect(): Promise<BraintreeConnectCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/connect.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.connect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.connect;
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/paypal-checkout.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.paypalCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.paypalCheckout;
    }

    async loadBraintreeLocalMethods() {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/local-payment.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.localPayment) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.localPayment;
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/data-collector.min.js`,
        );

        if (!this.braintreeHostWindow.braintree?.dataCollector) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.dataCollector;
    }

    async loadUsBankAccount(): Promise<BraintreeBankAccountCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/us-bank-account.min.js`,
        );

        if (
            !this.braintreeHostWindow.braintree ||
            !this.braintreeHostWindow.braintree.usBankAccount
        ) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.usBankAccount;
    }

    private getBraintreeSDKVersion() {
        const isAcceleratedCheckoutEnabled = true;

        return isAcceleratedCheckoutEnabled
            ? '3.95.0-connect-alpha.7'
            : '3.81.0';
    }
}
