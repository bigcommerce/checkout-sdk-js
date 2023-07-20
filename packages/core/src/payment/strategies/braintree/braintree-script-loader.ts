import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import { GooglePayCreator } from '../googlepay';

import {
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostedFieldsCreator,
    BraintreeHostWindow,
    BraintreeInitializationData,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeVenmoCheckoutCreator,
    BraintreeVisaCheckoutCreator,
} from './braintree';

const BraintreeSdkVersionStable = '3.95.0';

export default class BraintreeScriptLoader {
    private braintreeSdkVersion = BraintreeSdkVersionStable;

    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BraintreeHostWindow = window,
    ) {}

    // TODO: this method is needed only for braintree AXO
    // So can be removed after Beta stage
    initialize({ isAcceleratedCheckoutEnabled }: BraintreeInitializationData) {
        this.braintreeSdkVersion = isAcceleratedCheckoutEnabled
            ? '3.95.0-connect-alpha.7'
            : BraintreeSdkVersionStable;
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
