import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { TDCustomCheckoutSDK, TdOnlineMartHostWindow } from './td-online-mart';

export default class TDOnlineMartScriptLoader {
    constructor(
        private scriptLoader: ScriptLoader,
        private tdOnlineMartWindow: TdOnlineMartHostWindow = window,
    ) {}

    async load(): Promise<TDCustomCheckoutSDK> {
        if (!this.tdOnlineMartWindow.customcheckout) {
            await this.scriptLoader.loadScript(
                'https://libs.na.bambora.com/customcheckout/1/customcheckout.js',
            );
        }

        if (!this.tdOnlineMartWindow.customcheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.tdOnlineMartWindow.customcheckout();
    }
}
