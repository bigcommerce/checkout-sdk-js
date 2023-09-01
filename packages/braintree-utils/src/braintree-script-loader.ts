import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    PaymentMethodClientUnavailableError,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeBankAccountCreator,
    BraintreeClientCreator,
    BraintreeConnectCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreePaypalCheckoutCreator,
} from './braintree';
import { BRAINTREE_SDK_ALPHA_VERSION, BRAINTREE_SDK_STABLE_VERSION } from './sdk-verison';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion = BRAINTREE_SDK_STABLE_VERSION;

    constructor(
        private scriptLoader: ScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
    ) {}

    // TODO: this method is needed only for braintree AXO
    // So can be removed after Beta state
    initialize(storeConfig: StoreConfig) {
        const features = storeConfig.checkoutSettings.features;
        const shouldUseBraintreeAlphaVersion =
            features['PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree'] &&
            features['PAYPAL-2770.PayPal_Accelerated_checkout_ab_testing'];

        this.braintreeSdkVersion = shouldUseBraintreeAlphaVersion
            ? BRAINTREE_SDK_ALPHA_VERSION
            : BRAINTREE_SDK_STABLE_VERSION;
    }

    async loadClient(): Promise<BraintreeClientCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/client.min.js`,
        );

        if (!this.braintreeHostWindow.braintree || !this.braintreeHostWindow.braintree.client) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.client;
    }

    async loadConnect(): Promise<BraintreeConnectCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/connect.min.js`,
        );

        if (!this.braintreeHostWindow.braintree || !this.braintreeHostWindow.braintree.connect) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.connect;
    }

    async loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/paypal-checkout.min.js`,
        );

        if (
            !this.braintreeHostWindow.braintree ||
            !this.braintreeHostWindow.braintree.paypalCheckout
        ) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.paypalCheckout;
    }

    async loadBraintreeLocalMethods(): Promise<BraintreeLocalPaymentCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/local-payment.min.js`,
        );

        if (
            !this.braintreeHostWindow.braintree ||
            !this.braintreeHostWindow.braintree.localPayment
        ) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.localPayment;
    }

    async loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/data-collector.min.js`,
        );

        if (
            !this.braintreeHostWindow.braintree ||
            !this.braintreeHostWindow.braintree.dataCollector
        ) {
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
