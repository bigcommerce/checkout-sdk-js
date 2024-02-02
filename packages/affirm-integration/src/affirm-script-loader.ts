import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm, AffirmHostWindow, AffirmScripts } from './affirm';
import loadAffirmJS from './affirmJs';

export default class AffirmScriptLoader {
    constructor(public affirmWindow: AffirmHostWindow = window) {}

    load(apikey = '', testMode?: boolean): Promise<Affirm> {
        const scriptURI = this.getScriptURI(testMode);

        loadAffirmJS(apikey, scriptURI);

        if (!this.affirmWindow.affirm) {
            throw new PaymentMethodClientUnavailableError();
        }

        return Promise.resolve(this.affirmWindow.affirm);
    }

    private getScriptURI(testMode = false): string {
        const SCRIPTS_DEFAULT: AffirmScripts = {
            prod: '//cdn1.affirm.com/js/v2/affirm.js',
            sandbox: '//cdn1-sandbox.affirm.com/js/v2/affirm.js',
        };

        return testMode ? SCRIPTS_DEFAULT.sandbox : SCRIPTS_DEFAULT.prod;
    }
}
