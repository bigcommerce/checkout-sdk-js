import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { BoltCheckout, BoltHostWindow } from './bolt';

export default class BoltScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: BoltHostWindow = window
    ) {}

    async load(publishableKey: string, testMode?: boolean): Promise<BoltCheckout> {
        const options: LoadScriptOptions = {
            async: true,
            attributes: {
                id: 'bolt-connect',
                'data-publishable-key': publishableKey,
            },
        };

        await Promise.all([
            this._scriptLoader.loadScript(`//connect${testMode ? '-sandbox' : ''}.bolt.com/connect-bigcommerce.js`, options),
            this._scriptLoader.loadScript(`//connect${testMode ? '-sandbox' : ''}.bolt.com/track.js`),
        ]);

        if (!this._window.BoltCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.BoltCheckout;
    }
}
