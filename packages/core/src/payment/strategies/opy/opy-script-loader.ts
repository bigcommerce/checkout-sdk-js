import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { OpyHostWindow, OpyRegion, OpyWidget } from './opy-library';

const AU_REGION_URL = 'https://widgets.openpay.com.au/lib/openpay-widgets.min.js';

const SOURCES = {
    AU: AU_REGION_URL,
    UK: AU_REGION_URL,
    US: 'https://widgets.opy.com/lib/openpay-widgets.min.js',
};

export default class OpyScriptLoader {
    constructor(private _scriptLoader: ScriptLoader, private _window: OpyHostWindow = window) {}

    async loadOpyWidget(region = OpyRegion.AU): Promise<OpyWidget> {
        await this._scriptLoader.loadScript(SOURCES[region]);

        if (!this._window.OpenpayWidgets) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this._window.OpenpayWidgets;
    }
}
