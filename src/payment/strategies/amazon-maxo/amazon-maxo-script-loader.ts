import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentMethod from '../../payment-method';

import { AmazonMaxoHostWindow, AmazonMaxoRegions, AmazonMaxoSDK } from './amazon-maxo';

export default class AmazonMaxoScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AmazonMaxoHostWindow = window
    ) {}

    load(method: PaymentMethod): Promise<AmazonMaxoSDK> {
        const {
            initializationData: { region = 'us' } = {},
        } = method;

        const amazonMaxoRegion = (AmazonMaxoRegions as any)[region];

        return this._scriptLoader
            .loadScript(`https://static-${amazonMaxoRegion}.payments-amazon.com/checkout.js`)
            .then(() => {
                if (!this._window.amazon) {
                    throw new PaymentMethodClientUnavailableError();
                }

                return this._window.amazon;
            });
    }
}
