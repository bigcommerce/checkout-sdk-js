import { getScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import ApplePayScriptLoader from './apple-pay-script-loader';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';

describe('ApplePayScriptLoader', () => {
    let applePayScriptLoader: ApplePayScriptLoader;
    let scriptLoader: ScriptLoader;

    beforeEach(() => {
        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });

        scriptLoader = getScriptLoader();
        applePayScriptLoader = new ApplePayScriptLoader(scriptLoader);

        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve());
    });

    it('load ApplePaySDK', async () => {
        await applePayScriptLoader.loadSdk();

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js',
            {
                async: true,
                attributes: {
                    integrity:
                        'sha384-vh0JXIPFX+H2WsQVoWR8E10Q1mo5IZQ92/a42dBIbtW8DCQaLrOC16Au8awuZUwA',
                    crossorigin: 'anonymous',
                },
            },
        );
    });
});
