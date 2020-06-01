import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenHostWindow } from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';
import { getAdyenClient, getLiveAdyenConfiguration, getLoadScriptOptions, getLoadStylesheetOptions, getTestAdyenConfiguration } from './adyenv2.mock';

describe('AdyenV2ScriptLoader', () => {
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let stylesheetLoader: StylesheetLoader;
    let mockWindow: AdyenHostWindow;
    const adyenClient = getAdyenClient();
    const loadStylesheetOptions = getLoadStylesheetOptions();

    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        mockWindow = {} as AdyenHostWindow;
        scriptLoader = {} as ScriptLoader;
        stylesheetLoader = {} as StylesheetLoader;
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, stylesheetLoader, mockWindow);

        scriptLoader.loadScript = jest.fn(() => {
            mockWindow.AdyenCheckout = jest.fn(
                () => adyenClient
            );

            return Promise.resolve();
        });

        stylesheetLoader.loadStylesheet = jest.fn(() => Promise.resolve());

    });

    describe('#load() on test mode', () => {
        const configuration = getTestAdyenConfiguration();
        const jsUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.8.0/adyen.js';
        const cssUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.8.0/adyen.css';

        it('loads the JS and CSS test mode', async () => {
            await adyenV2ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, getLoadScriptOptions('test'));
            expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, loadStylesheetOptions);
        });

        it('returns the JS from the window', async () => {
            const adyenJs = await adyenV2ScriptLoader.load(configuration);

            expect(adyenJs).toBe(adyenClient);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = undefined;

                return Promise.resolve();
            });

            try {
                await adyenV2ScriptLoader.load(configuration);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#load() on live mode', () => {
        const configuration = getLiveAdyenConfiguration();
        const jsUrl = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/3.8.0/adyen.js';
        const cssUrl = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/3.8.0/adyen.css';

        it('loads the JS and CSS live mode', async () => {
            await adyenV2ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, getLoadScriptOptions('live'));
            expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, loadStylesheetOptions);
        });

        it('returns the JS from the window', async () => {
            const adyenJs = await adyenV2ScriptLoader.load(configuration);

            expect(adyenJs).toBe(adyenClient);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = undefined;

                return Promise.resolve();
            });

            try {
                await adyenV2ScriptLoader.load(configuration);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
