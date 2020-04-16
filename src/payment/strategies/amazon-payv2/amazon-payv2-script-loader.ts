import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentMethod from '../../payment-method';

import { AmazonPayv2HostWindow, AmazonPayv2Regions, AmazonPayv2SDK } from './amazon-payv2';

export default class AmazonPayv2ScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: AmazonPayv2HostWindow = window
    ) {}

    async load(method: PaymentMethod): Promise<AmazonPayv2SDK> {
        const {
            initializationData: { region = 'us' } = {},
        } = method;

        const amazonPayv2Region  = (AmazonPayv2Regions as any)[region];

        await this._scriptLoader.loadScript(`https://static-${amazonPayv2Region}.payments-amazon.com/checkout.js`);
        if (!this._window.amazon) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.amazon;
    }
}
