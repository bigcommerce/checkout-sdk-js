import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenHostWindow } from './adyenv3';
import AdyenV3ScriptLoader from './adyenv3-script-loader';
import { getAdyenClient, getAdyenConfiguration } from './adyenv3.mock';

describe('AdyenV3ScriptLoader', () => {
    let adyenV3ScriptLoader: AdyenV3ScriptLoader;
    let scriptLoader: ScriptLoader;
    let stylesheetLoader: StylesheetLoader;
    let mockWindow: AdyenHostWindow;

    beforeEach(() => {
        mockWindow = {} as AdyenHostWindow;
        scriptLoader = {} as ScriptLoader;
        stylesheetLoader = {} as StylesheetLoader;
        adyenV3ScriptLoader = new AdyenV3ScriptLoader(scriptLoader, stylesheetLoader, mockWindow);
    });

    describe('#load()', () => {
        const adyenClient = getAdyenClient();
        const configuration = getAdyenConfiguration();
        const jsUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/5.58.0/adyen.js';
        const cssUrl =
            'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/5.58.0/adyen.css';
        const cssOptions = {
            prepend: false,
            attributes: {
                integrity:
                    'sha384-zgFNrGzbwuX5qJLys75cOUIGru/BoEzhGMyC07I3OSdHqXuhUfoDPVG03G+61oF4',
                crossorigin: 'anonymous',
            },
        };
        const jsOptions = {
            async: true,
            attributes: {
                integrity:
                    'sha384-e0EBlzLdOXxOJimp2uut2z1m98HS2cdhQw+OmeJDp7MRCPRNrQhjIWZiWiIscJvf',
                crossorigin: 'anonymous',
            },
        };

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = jest.fn(() => adyenClient);

                return Promise.resolve();
            });

            stylesheetLoader.loadStylesheet = jest.fn(() => Promise.resolve());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('loads the JS and CSS', async () => {
            await adyenV3ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, jsOptions);
            expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, cssOptions);
        });

        it('returns the JS from the window', async () => {
            const adyenJs = await adyenV3ScriptLoader.load(configuration);

            expect(adyenJs).toBe(adyenClient);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = undefined;

                return Promise.resolve();
            });

            try {
                await adyenV3ScriptLoader.load(configuration);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
