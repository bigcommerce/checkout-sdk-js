import { LoadScriptOptions, ScriptLoader } from '@bigcommerce/script-loader';

import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentMethodClientUnavailableError } from '../../errors';

import {
    BoltCheckout,
    BoltDeveloperMode,
    BoltDeveloperModeParams,
    BoltEmbedded,
    BoltHostWindow,
} from './bolt';

export default class BoltScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, public _window: BoltHostWindow = window) {}

    async loadBoltClient(
        publishableKey?: string,
        testMode?: boolean,
        developerModeParams?: BoltDeveloperModeParams,
    ): Promise<BoltCheckout> {
        if (this._window.BoltCheckout) {
            return this._window.BoltCheckout;
        }

        if (!publishableKey) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "publishableKey" argument is not provided.',
            );
        }

        await Promise.all([
            this._scriptLoader.loadScript(
                `//${this.getDomainURL(!!testMode, developerModeParams)}/connect-bigcommerce.js`,
                this._getScriptOptions('bolt-connect', publishableKey),
            ),
            this._scriptLoader.loadScript(
                `//${this.getDomainURL(!!testMode, developerModeParams)}/track.js`,
                this._getScriptOptions('bolt-track', publishableKey),
            ),
        ]);

        if (!this._window.BoltCheckout) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.BoltCheckout;
    }

    async loadBoltEmbedded(
        publishableKey: string,
        testMode?: boolean,
        developerModeParams?: BoltDeveloperModeParams,
    ): Promise<BoltEmbedded> {
        const options: LoadScriptOptions = {
            async: true,
            attributes: {
                id: 'bolt-embedded',
            },
        };

        await this._scriptLoader.loadScript(
            `//${this.getDomainURL(!!testMode, developerModeParams)}/embed.js`,
            options,
        );

        if (!this._window.Bolt) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.Bolt(publishableKey);
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

    private _getScriptOptions(id: string, publishableKey: string): LoadScriptOptions {
        return {
            async: true,
            attributes: {
                id,
                'data-publishable-key': publishableKey,
            },
        };
    }
}
