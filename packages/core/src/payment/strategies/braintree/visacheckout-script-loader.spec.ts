import { ScriptLoader } from '@bigcommerce/script-loader';

import { VisaCheckoutHostWindow, VisaCheckoutSDK } from './visacheckout';
import VisaCheckoutScriptLoader from './visacheckout-script-loader';
import { getVisaCheckoutSDKMock } from './visacheckout.mock';

describe('VisaCheckoutScriptLoader', () => {
    let visaCheckoutScriptLoader: VisaCheckoutScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: VisaCheckoutHostWindow;

    beforeEach(() => {
        mockWindow = { } as VisaCheckoutHostWindow;
        scriptLoader = {} as ScriptLoader;
        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let visaCheckoutSDKMock: VisaCheckoutSDK;

        beforeEach(() => {
            visaCheckoutSDKMock = getVisaCheckoutSDKMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.V = visaCheckoutSDKMock;

                return Promise.resolve();
            });
        });

        it('loads the SDK', async () => {
            await visaCheckoutScriptLoader.load();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js');
        });

        it('returns the SDK from the window', async () => {
            const sdk = await visaCheckoutScriptLoader.load();
            expect(sdk).toBe(visaCheckoutSDKMock);
        });

        describe('when testMode is on', () => {
            it('loads the SDK in sandbox mode', async () => {
                await visaCheckoutScriptLoader.load(true);
                expect(scriptLoader.loadScript).toHaveBeenCalledWith('//sandbox-assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js');
            });

            it('returns the SDK from the window', async () => {
                const sdk = await visaCheckoutScriptLoader.load(true);
                expect(sdk).toBe(visaCheckoutSDKMock);
            });
        });
    });
});
