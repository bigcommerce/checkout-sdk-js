import { ScriptLoader } from '@bigcommerce/script-loader';

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

const version = '3.95.0';

export default class BraintreeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BraintreeHostWindow = window,
    ) {}

    loadClient(): Promise<BraintreeClientCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/client.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.client) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.client;
            });
    }

    load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/three-d-secure.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.threeDSecure) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.threeDSecure;
            });
    }

    loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/data-collector.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.dataCollector) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.dataCollector;
            });
    }

    loadPaypal(): Promise<BraintreePaypalCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/paypal.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypal) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypal;
            });
    }

    loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/paypal-checkout.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypalCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypalCheckout;
            });
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/visa-checkout.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.visaCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.visaCheckout;
            });
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/venmo.min.js`)
            .then(() => {
                if (!this._window.braintree?.venmo) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.venmo;
            });
    }

    loadGooglePayment(): Promise<GooglePayCreator> {
        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${version}/js/google-payment.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.googlePayment) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.googlePayment;
            });
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        await this._scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${version}/js/hosted-fields.min.js`,
        );

        if (!this._window.braintree || !this._window.braintree.hostedFields) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.braintree.hostedFields;
    }
}
