import { ScriptLoader } from '@bigcommerce/script-loader';

import { VisaCheckoutHostWindow, VisaCheckoutSDK } from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class VisaCheckoutScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: VisaCheckoutHostWindow = window,
    ) {}

    load(testMode?: boolean): Promise<VisaCheckoutSDK> {
        return this._scriptLoader
            .loadScript(
                `//${
                    testMode ? 'sandbox-' : ''
                }assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js`,
            )
            .then(() => {
                if (!this._window.V) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.V;
            });
    }
}
