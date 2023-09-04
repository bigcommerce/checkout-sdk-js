import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    BRAINTREE_SDK_ALPHA_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import { StoreConfig } from '../../../config';
import { PaymentMethodClientUnavailableError } from '../../errors';
import { GooglePayCreator } from '../googlepay';

import {
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostedFieldsCreator,
    BraintreeHostWindow,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeVenmoCheckoutCreator,
    BraintreeVisaCheckoutCreator,
} from './braintree';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion = BRAINTREE_SDK_STABLE_VERSION;

    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BraintreeHostWindow = window,
    ) {}

    // TODO: this method is needed only for braintree AXO
    // So can be removed after Beta stage
    initialize(storeConfig: StoreConfig) {
        const features = storeConfig.checkoutSettings.features;
        const shouldUseBraintreeAlphaVersion =
            features['PROJECT-5505.PayPal_Accelerated_Checkout_v2_for_Braintree'];

        this.braintreeSdkVersion = shouldUseBraintreeAlphaVersion
            ? BRAINTREE_SDK_ALPHA_VERSION
            : BRAINTREE_SDK_STABLE_VERSION;
    }

    loadClient(): Promise<BraintreeClientCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/client.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.client) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.client;
            });
    }

    load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/three-d-secure.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.threeDSecure) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.threeDSecure;
            });
    }

    loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/data-collector.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.dataCollector) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.dataCollector;
            });
    }

    loadPaypal(): Promise<BraintreePaypalCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/paypal.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypal) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypal;
            });
    }

    loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/paypal-checkout.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypalCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypalCheckout;
            });
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/visa-checkout.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.visaCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.visaCheckout;
            });
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/venmo.min.js`)
            .then(() => {
                if (!this._window.braintree?.venmo) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.venmo;
            });
    }

    loadGooglePayment(): Promise<GooglePayCreator> {
        return this._scriptLoader
            .loadScript(
                `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/google-payment.min.js`,
            )
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.googlePayment) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.googlePayment;
            });
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        await this._scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${this.braintreeSdkVersion}/js/hosted-fields.min.js`,
        );

        if (!this._window.braintree || !this._window.braintree.hostedFields) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.braintree.hostedFields;
    }
}
