import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Affirm, AFFIRM_SCRIPTS, AffirmHostWindow } from './affirm';
import loadAffirmJS from './affirmJs';

export default class AffirmScriptLoader {
    constructor(public affirmWindow: AffirmHostWindow = window) {}

    load(apikey = '', testMode?: boolean): Promise<Affirm> {
        const scriptURI = testMode ? AFFIRM_SCRIPTS.SANDBOX : AFFIRM_SCRIPTS.PROD;

        console.log('affirm script loader ', scriptURI);
        // eslint-disable-next-line no-debugger
        console.log('SCRIPT LOADER this.affirmWindow.affirm 1 ', this.affirmWindow.affirm);
        loadAffirmJS(apikey, scriptURI);
        //czyli jednak w tym miejscu się coś dzieje. this.affirmWindow nie ma juz metody 'on' ma tylko 'ready'. Czyli trzeba przeanalizować ten skrypt
        console.log('SCRIPT LOADER window', window);
        console.log('SCRIPT LOADER this.affirmWindow.affirm 2', this.affirmWindow.affirm);

        console.log(
            'JSON this.affirmWindow.affirm',
            JSON.parse(JSON.stringify(this.affirmWindow.affirm)),
        );

        if (!this.affirmWindow.affirm) {
            throw new PaymentMethodClientUnavailableError();
        }

        // console.log(
        //     'Promise.resolve(this.affirmWindow.affirm)',
        //     Promise.resolve(this.affirmWindow.affirm),
        // );

        // console.log(
        //     'this.affirmWindow.affirm',
        //     JSON.parse(JSON.stringify(this.affirmWindow.affirm)),
        // );

        return Promise.resolve(this.affirmWindow.affirm);
    }
}
