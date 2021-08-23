import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import { BoltCheckout, BoltDeveloperMode, BoltDeveloperModeParams, BoltHostWindow } from './bolt';

export default class BoltScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        public _window: BoltHostWindow = window
    ) {}

    async load(publishableKey?: string, testMode?: boolean, developerModeParams?: BoltDeveloperModeParams): Promise<BoltCheckout> {
        if (this._window.BoltCheckout) {
            return this._window.BoltCheckout;
        }

        if (!publishableKey) {
            throw new InvalidArgumentError('Unable to initialize payment because "publishableKey" argument is not provided.');
        }

        const options: LoadScriptOptions = {
            async: true,
            attributes: {
                id: 'bolt-connect',
                'data-publishable-key': publishableKey,
            },
        };

        await Promise.all([
            this._scriptLoader.loadScript(`//${this.getDomainURL(!!testMode, developerModeParams)}/connect-bigcommerce.js`, options),
            this._scriptLoader.loadScript(`//${this.getDomainURL(!!testMode, developerModeParams)}/track.js`),
        ]);

        if (!this._window.BoltCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.BoltCheckout;
    }

    private getDomainURL(testMode: boolean, developerModeParams?: BoltDeveloperModeParams): string {

        if (!testMode) {
            return 'connect.bolt.com';
        }

        if (developerModeParams) {
            switch (developerModeParams.developerMode) {
                case BoltDeveloperMode.StagingMode:
                    return 'connect-staging.bolt.com';
                case BoltDeveloperMode.DevelopmentMode:
                    return `connect.${developerModeParams.developerDomain}`;
            }
        }

        return 'connect-sandbox.bolt.com';
    }
}
