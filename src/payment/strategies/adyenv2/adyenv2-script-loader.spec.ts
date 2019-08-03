import { ScriptLoader } from '@bigcommerce/script-loader';

​
import { StandardError } from '../../../common/error/errors';

import { AdyenConfiguration, AdyenHostWindow } from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';
import { getAdyenClient, getAdyenConfiguration } from './adyenv2.mock';
​
describe('AdyenV2ScriptLoader', () => {
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: AdyenHostWindow;
​
    beforeEach(() => {
        mockWindow = { } as AdyenHostWindow;
        scriptLoader = {} as ScriptLoader;
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, mockWindow);
    });
​
    describe('#load()', () => {
        const adyenClient = getAdyenClient();
​
        const configuration = getAdyenConfiguration();
​
        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = jest.fn(
                    (configuration: AdyenConfiguration) => adyenClient
                );
​
                return Promise.resolve();
            });
​
            const stylesheet = document.createElement('link') as HTMLLinkElement;
​
            jest.spyOn(document, 'createElement')
                .mockImplementation(() => stylesheet);
​
            jest.spyOn(document.head, 'appendChild').mockReturnValue(Promise.resolve());
        });
​
        afterEach(() => {
            jest.restoreAllMocks();
        });
​
        it('loads the JS', async () => {
            await adyenV2ScriptLoader.load(configuration);
​
            expect(scriptLoader.loadScript).toHaveBeenCalledWith(`https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`);
        });
​
        it('returns the JS from the window', async () => {
            const adyenJs = await adyenV2ScriptLoader.load(configuration);
​
            expect(adyenJs).toBe(adyenClient);
        });
​
        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = undefined;
​
                return Promise.resolve();
            });
​
            try {
                await adyenV2ScriptLoader.load(configuration);
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });
    });
});
