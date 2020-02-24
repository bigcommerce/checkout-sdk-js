import { ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalCommerceHostWindow, PaypalCommerceScriptOptions, PaypalCommerceSDK } from './paypal-commerce-sdk';

export default class PaypalCommerceScriptLoader {
    private _window: PaypalCommerceHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    async loadPaypalCommerce(options: PaypalCommerceScriptOptions): Promise<PaypalCommerceSDK> {
        if (!options || !options['client-id']) {
            throw new InvalidArgumentError();
        }
        const params = (Object.keys(options) as Array<keyof PaypalCommerceScriptOptions>)
            .map(key => `${key}=${options[key]}`)
            .join('&');

        const scriptSrc = `https://www.paypal.com/sdk/js?${params}`;

        await this._scriptLoader.loadScript(scriptSrc, { async: true, attributes: {} });

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }
}
