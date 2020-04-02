import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentMethod from '../../payment-method';

import { AmazonMaxoHostWindow, AmazonMaxoRegions, AmazonMaxoSDK } from './amazon-maxo';

export default class AmazonMaxoScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AmazonMaxoHostWindow = window
    ) {}

    async load(method: PaymentMethod): Promise<AmazonMaxoSDK> {
        const {
            initializationData: { region = 'us' } = {},
        } = method;

        const amazonMaxoRegion  = (AmazonMaxoRegions as any)[region];

        await this._scriptLoader.loadScript(`https://static-${amazonMaxoRegion}.payments-amazon.com/checkout.js`);
        if (!this._window.amazon) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.amazon;
    }
}
