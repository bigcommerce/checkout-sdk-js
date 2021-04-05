import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { DigitalRiverWindow } from './digitalriver';

export default class DigitalRiverScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader,
        private _stylesheetLoader: StylesheetLoader,
        private _window: DigitalRiverWindow = window
    ) {}

    async load(): Promise<DigitalRiverWindow> {
        await Promise.all([
            this._stylesheetLoader.loadStylesheet(`https://js.digitalriverws.com/v1/css/DigitalRiver.css`),
            this._scriptLoader.loadScript(`https://js.digitalriverws.com/v1/DigitalRiver.js`),
        ]);

        return Promise.resolve(this._window);
    }
}
