import { ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalCommerceHostWindow, PaypalCommerceScriptParams, PaypalCommerceSDK } from './paypal-commerce-sdk';

export default class PaypalCommerceScriptLoader {
    private _window: PaypalCommerceHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    async loadPaypalCommerce(params: PaypalCommerceScriptParams, isProgressiveOnboardingAvailable?: boolean): Promise<PaypalCommerceSDK> {
        this._validateParams(params, isProgressiveOnboardingAvailable);

        if (!this._window.paypalLoadScript) {
            const scriptSrc = 'https://unpkg.com/@paypal/paypal-js@1.0.2/dist/paypal.browser.min.js';

            await this._scriptLoader.loadScript(scriptSrc, {async: true, attributes: {}});

            if (!this._window.paypalLoadScript) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        await this._window.paypalLoadScript(params);

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }

    _validateParams(options: PaypalCommerceScriptParams, isProgressiveOnboardingAvailable?: boolean): void {
        const CLIENT_ID = 'client-id';
        const MERCHANT_ID = 'merchant-id';
        let param;

        if (!options) {
            param = 'options';
        } else if (!options[CLIENT_ID]) {
            param = CLIENT_ID;
        } else if (!options[MERCHANT_ID] && !isProgressiveOnboardingAvailable) {
            param = MERCHANT_ID;
        }

        if (param) {
            throw new InvalidArgumentError(`Unable to proceed because "${param}" argument in PayPal script is not provided.`);
        }
    }
}
