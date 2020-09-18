import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';
import { isNil, kebabCase } from 'lodash';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalCommerceHostWindow, PaypalCommerceScriptAttribute, PaypalCommerceScriptOptions, PaypalCommerceSDK } from './paypal-commerce-sdk';

export interface DataPaypalCommerceScript {
    options: PaypalCommerceScriptOptions;
    attr?: PaypalCommerceScriptAttribute;
}

export default class PaypalCommerceScriptLoader {
    private _window: PaypalCommerceHostWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    async loadPaypalCommerce({options, attr}: DataPaypalCommerceScript, isProgressiveOnboardingAvailable?: boolean): Promise<PaypalCommerceSDK> {
        this._validateParams(options, isProgressiveOnboardingAvailable);

        let attributes: LoadScriptOptions['attributes'] = {};
        const { disableFunding } = options;
        const updatedOptions = disableFunding
            ? { ...options, disableFunding: disableFunding.join(',') }
            : options;

        const params = (Object.keys(updatedOptions) as Array<keyof PaypalCommerceScriptOptions>)
            .filter(key => !isNil(options[key]))
            .map(key => `${kebabCase(key)}=${options[key]}`)
            .join('&');

        if (attr) {
            attributes = (Object.keys(attr) as Array<keyof PaypalCommerceScriptAttribute>)
                .reduce((attributes, key) =>
                    attr[key] ? { ...attributes, [`data-${kebabCase(key)}`]: attr[key] } : attributes
                , {});
        }

        const scriptSrc = `https://www.paypal.com/sdk/js?${params}`;

        await this._scriptLoader.loadScript(scriptSrc, { async: true, attributes });

        if (!this._window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.paypal;
    }

    _validateParams(options: PaypalCommerceScriptOptions, isProgressiveOnboardingAvailable?: boolean): void {
        const CLIENT_ID = 'clientId';
        const MERCHANT_ID = 'merchantId';
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
