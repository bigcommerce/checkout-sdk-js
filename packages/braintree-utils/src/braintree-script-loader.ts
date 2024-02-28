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
    BraintreeFastlaneCreator,
    BraintreeHostWindow,
    BraintreeLocalPaymentCreator,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    GooglePayCreator,
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
    initialize(storeConfig?: StoreConfig) {
        const features = storeConfig?.checkoutSettings.features;
        const shouldUseBraintreeAlphaVersion =
            features && features['PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree'];

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

    async loadFastlane(): Promise<BraintreeFastlaneCreator> {
        await this.scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/fastlane.min.js`,
        );

        if (!this.braintreeHostWindow.braintree || !this.braintreeHostWindow.braintree.fastlane) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.braintreeHostWindow.braintree.fastlane;
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

    async loadPaypal(): Promise<BraintreePaypalCreator> {
        return this.scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/paypal.min.js`,
            )
            .then(() => {
                if (
                    !this.braintreeHostWindow.braintree ||
                    !this.braintreeHostWindow.braintree.paypal
                ) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this.braintreeHostWindow.braintree.paypal;
            });
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

    loadGooglePayment(): Promise<GooglePayCreator> {
        return this.scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/google-payment.min.js`,
            )
            .then(() => {
                if (
                    !this.braintreeHostWindow.braintree ||
                    !this.braintreeHostWindow.braintree.googlePayment
                ) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this.braintreeHostWindow.braintree.googlePayment;
            });
    }

    load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this.scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/three-d-secure.min.js`,
            )
            .then(() => {
                if (
                    !this.braintreeHostWindow.braintree ||
                    !this.braintreeHostWindow.braintree.threeDSecure
                ) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this.braintreeHostWindow.braintree.threeDSecure;
            });
    }
}
