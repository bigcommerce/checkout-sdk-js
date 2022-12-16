import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { Masterpass, MasterpassHostWindow } from './masterpass';

interface MasterpassScriptLoaderParams {
    useMasterpassSrc: boolean;
    language: string;
    testMode?: boolean;
    checkoutId?: string;
}

export default class MasterpassScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: MasterpassHostWindow = window,
    ) {}

    async load({
        useMasterpassSrc,
        language,
        testMode,
        checkoutId,
    }: MasterpassScriptLoaderParams): Promise<Masterpass> {
        if (useMasterpassSrc) {
            const subdomain = testMode ? 'sandbox.' : '';
            const params = [`locale=${language}`, `checkoutid=${checkoutId}`];

            const sourceUrl = [
                `https://${subdomain}src.mastercard.com/srci/integration/merchant.js`,
                params.join('&'),
            ].join('?');

            await this._scriptLoader.loadScript(sourceUrl);

            if (!this._window.masterpass) {
                throw new PaymentMethodClientUnavailableError();
            }

            return this._window.masterpass;
        }

        await this._scriptLoader.loadScript(
            `//${testMode ? 'sandbox.' : ''}masterpass.com/integration/merchant.js`,
        );

        if (!this._window.masterpass) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.masterpass;
    }
}
