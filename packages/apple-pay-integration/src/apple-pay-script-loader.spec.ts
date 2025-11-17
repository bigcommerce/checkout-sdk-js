import { getScriptLoader } from '@bigcommerce/script-loader';

import ApplePayScriptLoader from './apple-pay-script-loader';
import * as isApplePayWindow from './is-apple-pay-window';
import { MockApplePaySession } from './mocks/apple-pay-payment.mock';

describe('ApplePayScriptLoader', () => {
    const scriptLoader = getScriptLoader();
    const applePayScriptLoader = new ApplePayScriptLoader(scriptLoader);
    const mockLoadScript = jest
        .spyOn(scriptLoader, 'loadScript')
        .mockReturnValue(Promise.resolve());
    const mockIsApplePayWindow = jest.spyOn(isApplePayWindow, 'default');

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('loads Apple Pay SDK when script has not been loaded before', async () => {
        mockIsApplePayWindow.mockReturnValueOnce(false).mockReturnValueOnce(true);

        await applePayScriptLoader.loadSdk();

        expect(mockLoadScript).toHaveBeenCalledWith(
            'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js',
        );
    });

    it('does not load script when ApplePaySession is available on window', async () => {
        Object.defineProperty(window, 'ApplePaySession', {
            writable: true,
            value: MockApplePaySession,
        });

        await applePayScriptLoader.loadSdk();

        expect(mockLoadScript).not.toHaveBeenCalled();
    });

    it('throws error when script appears loaded but ApplePaySession is not available', async () => {
        mockIsApplePayWindow.mockReturnValue(false);

        await expect(applePayScriptLoader.loadSdk()).rejects.toThrow('Apple pay is not supported');
    });
});
