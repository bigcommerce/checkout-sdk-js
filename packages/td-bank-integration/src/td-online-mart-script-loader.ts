import { ScriptLoader } from '@bigcommerce/script-loader';

export default class TDOnlineMartScriptLoader {
    constructor(private scriptLoader: ScriptLoader) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    async load() {
        await this.scriptLoader.loadScript(
            'https://libs.na.bambora.com/customcheckout/1/customcheckout.js',
        );
    }
}
