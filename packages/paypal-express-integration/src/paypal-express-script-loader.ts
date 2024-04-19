import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { PaypalHostWindow, PaypalSDK } from './paypal-express-types';

export default class PaypalScriptLoader {
    private window: PaypalHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async loadPaypalSDK(merchantId = ''): Promise<PaypalSDK> {
        const scriptSrc = '//www.paypalobjects.com/api/checkout.min.js';
        const options: LoadScriptOptions = {
            async: true,
            attributes: { 'data-merchant-id': merchantId },
            ...(merchantId && {
                attributes: { 'data-merchant-id': merchantId },
            }),
        };

        await this.scriptLoader.loadScript(scriptSrc, options);

        if (!this.window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypal;
    }
}
