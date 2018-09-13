import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import {GooglePayCreator} from '../googlepay';

import {
    BraintreeClientCreator,
    BraintreeDataCollectorCreator,
    BraintreeHostWindow,
    BraintreePaypalCheckoutCreator,
    BraintreePaypalCreator,
    BraintreeThreeDSecureCreator,
    BraintreeVisaCheckoutCreator,
} from './braintree';

export default class BraintreeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: BraintreeHostWindow = window
    ) {}

    loadClient(): Promise<BraintreeClientCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.37.0/js/client.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.client) {
                    throw new StandardError();
                }

                return this._window.braintree.client;
            });
    }

    load3DS(): Promise<BraintreeThreeDSecureCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/three-d-secure.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.threeDSecure) {
                    throw new StandardError();
                }

                return this._window.braintree.threeDSecure;
            });
    }

    loadDataCollector(): Promise<BraintreeDataCollectorCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/data-collector.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.dataCollector) {
                    throw new StandardError();
                }

                return this._window.braintree.dataCollector;
            });
    }

    loadPaypal(): Promise<BraintreePaypalCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/paypal.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypal) {
                    throw new StandardError();
                }

                return this._window.braintree.paypal;
            });
    }

    loadPaypalCheckout(): Promise<BraintreePaypalCheckoutCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/paypal-checkout.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypalCheckout) {
                    throw new StandardError();
                }

                return this._window.braintree.paypalCheckout;
            });
    }

    loadVisaCheckout(): Promise<BraintreeVisaCheckoutCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/visa-checkout.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.visaCheckout) {
                    throw new StandardError();
                }

                return this._window.braintree.visaCheckout;
            });
    }

    loadGooglePaymentComponent(): Promise<GooglePayCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.37.0/js/google-payment.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.googlePayment) {
                    throw new StandardError();
                }

                return this._window.braintree.googlePayment;
            });
    }
}
