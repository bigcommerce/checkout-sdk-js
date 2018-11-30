import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { GooglePayHostWindow, GooglePaySDK } from './googlepay';
import GooglePayScriptLoader from './googlepay-script-loader';
import { getGooglePaySDKMock } from './googlepay.mock';

describe('GooglePayScriptLoader', () => {
    let googlePayScriptLoader: GooglePayScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: GooglePayHostWindow;

    beforeEach(() => {
        mockWindow = { } as GooglePayHostWindow;
        scriptLoader = {} as ScriptLoader;
        googlePayScriptLoader = new GooglePayScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let googlePaySDKMock: GooglePaySDK;

        beforeEach(() => {
            googlePaySDKMock = getGooglePaySDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.google = googlePaySDKMock;

                return Promise.resolve();
            });
        });

        it('loads the SDK', async () => {
            await googlePayScriptLoader.load();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://pay.google.com/gp/p/js/pay.js');
        });

        it('returns the SDK from the window', async () => {
            const sdk = await googlePayScriptLoader.load();
            expect(sdk).toBe(googlePaySDKMock);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.google = undefined;

                return Promise.resolve();
            });

            try {
                await googlePayScriptLoader.load();
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });
    });
});
