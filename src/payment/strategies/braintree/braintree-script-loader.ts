import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import * as Braintree from './braintree';

export default class BraintreeScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: Braintree.HostWindow = window
    ) {}

    loadClient(): Promise<Braintree.ClientCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/client.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.client) {
                    throw new StandardError();
                }

                return this._window.braintree.client;
            });
    }

    load3DS(): Promise<Braintree.ThreeDSecureCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/three-d-secure.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.threeDSecure) {
                    throw new StandardError();
                }

                return this._window.braintree.threeDSecure;
            });
    }

    loadDataCollector(): Promise<Braintree.DataCollectorCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/data-collector.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.dataCollector) {
                    throw new StandardError();
                }

                return this._window.braintree.dataCollector;
            });
    }

    loadPaypal(): Promise<Braintree.PaypalCreator> {
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/paypal.min.js')
            .then(() => {
                if (!this._window.braintree || !this._window.braintree.paypal) {
                    throw new StandardError();
                }

                return this._window.braintree.paypal;
            });
    }
}
