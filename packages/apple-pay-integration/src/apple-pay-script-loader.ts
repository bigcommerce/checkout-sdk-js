import { ScriptLoader } from '@bigcommerce/script-loader';

import { assertApplePayWindow } from './apple-pay-session-factory';
import isApplePaySdkWindow from './is-apple-pay-sdk-window';

export default class ApplePayScriptLoader {
    private sdkVersion = '1.latest';

    constructor(private scriptLoader: ScriptLoader) {}

    async loadSdk() {
        if (isApplePaySdkWindow(window)) {
            return;
        }

        await this.scriptLoader.loadScript(
            `https://applepay.cdn-apple.com/jsapi/${this.sdkVersion}/apple-pay-sdk.js`,
        );

        assertApplePayWindow(window);
    }
}
