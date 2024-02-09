import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm, AFFIRM_SCRIPTS, AffirmHostWindow } from './affirm';
import loadAffirmJS from './affirmJs';

export default class AffirmScriptLoader {
    constructor(public affirmWindow: AffirmHostWindow = window) {}

    load(apikey = '', testMode?: boolean): Promise<Affirm> {
        const scriptURI = testMode ? AFFIRM_SCRIPTS.SANDBOX : AFFIRM_SCRIPTS.PROD;

        loadAffirmJS(apikey, scriptURI);

        if (!this.affirmWindow.affirm) {
            throw new PaymentMethodClientUnavailableError();
        }

        return Promise.resolve(this.affirmWindow.affirm);
    }
}
