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

export default class BraintreeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BraintreeHostWindow = window,
    ) {}

    loadClient(): Promise<BraintreeClientCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/client.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.client) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.client;
            });
    }

    load3DS(): Promise<BraintreeThreeDSecureCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/three-d-secure.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.threeDSecure) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.threeDSecure;
            });
    }

    loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/data-collector.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.dataCollector) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.dataCollector;
            });
    }

    loadPaypal(): Promise<BraintreePaypalCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/paypal.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypal) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypal;
            });
    }

    loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/paypal-checkout.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypalCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.paypalCheckout;
            });
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/visa-checkout.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.visaCheckout) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.visaCheckout;
            });
    }

    loadVenmoCheckout(): Promise<BraintreeVenmoCheckoutCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/venmo.min.js`)
            .then(() => {
                if (!this._window.braintree?.venmo) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.venmo;
            });
    }

    loadGooglePayment(): Promise<GooglePayCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        return this._scriptLoader
            .loadScript(`//js.braintreegateway.com/web/${braintreeSdkVersion}/js/google-payment.min.js`)
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.googlePayment) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.braintree.googlePayment;
            });
    }

    async loadHostedFields(): Promise<BraintreeHostedFieldsCreator> {
        const braintreeSdkVersion = this.getBraintreeSDKVersion();

        await this._scriptLoader.loadScript(
            `//js.braintreegateway.com/web/${braintreeSdkVersion}/js/hosted-fields.min.js`,
        );

        if (!this._window.braintree || !this._window.braintree.hostedFields) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.braintree.hostedFields;
    }

    private getBraintreeSDKVersion() {
        const isAcceleratedCheckoutEnabled = true;

        return isAcceleratedCheckoutEnabled
            ? '3.95.0-connect-alpha.7'
            : '3.81.0';
    }
}
