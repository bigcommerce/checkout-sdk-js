import { ScriptLoader } from '@bigcommerce/script-loader';
import { kebabCase } from 'lodash';

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
        if (!options || !options.clientId) {
            throw new InvalidArgumentError();
        }

        const { disableFunding } = options;
        const updatedOptions = disableFunding
            ? { ...options, disableFunding: disableFunding.join(',') }
            : options;

        const params = (Object.keys(updatedOptions) as Array<keyof PaypalCommerceScriptOptions>)
            .map(key => `${kebabCase(key)}=${options[key]}`)
            .join('&');

        const scriptSrc = `https://www.paypal.com/sdk/js?${params}`;

        await this._scriptLoader.loadScript(scriptSrc, { async: true, attributes: {} });

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }
}
