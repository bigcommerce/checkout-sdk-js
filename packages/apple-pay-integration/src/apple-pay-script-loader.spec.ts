import { getScriptLoader } from '@bigcommerce/script-loader';

import ApplePayScriptLoader from './apple-pay-script-loader';
import * as isApplePaySdkWindow from './is-apple-pay-sdk-window';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';

describe('ApplePayScriptLoader', () => {
    const scriptLoader = getScriptLoader();
    const applePayScriptLoader = new ApplePayScriptLoader(scriptLoader);
    const mockLoadScript = jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
        Object.defineProperty(window, 'ApplePaySDK', {
            writable: true,
            value: {
                origin: 'https://applepay.cdn-apple.com/jsapi/1.latest',
                publicPath: 'https://applepay.cdn-apple.com',
            },
        });

        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });

        return Promise.resolve();
    });
    const mockIsApplePaySdkWindow = jest.spyOn(isApplePaySdkWindow, 'default');

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('loads Apple Pay SDK when script has not been loaded before', async () => {
        mockIsApplePaySdkWindow.mockReturnValueOnce(false);

        await applePayScriptLoader.loadSdk();

        expect(mockLoadScript).toHaveBeenCalledWith(
            'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js',
        );
    });

    it('do not load Apple Pay SDK when script has already been loaded', async () => {
        mockIsApplePaySdkWindow.mockReturnValue(true);

        expect(mockLoadScript).not.toHaveBeenCalledWith(
            'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js',
        );
    });

    it('does not load script when ApplePaySDK is available on window', async () => {
        await applePayScriptLoader.loadSdk();

        expect(mockLoadScript).not.toHaveBeenCalled();
    });
});
