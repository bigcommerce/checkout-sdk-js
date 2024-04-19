import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdyenV2HostWindow } from '../types';

import AdyenV2ScriptLoader from './adyenv2-script-loader';
import { getAdyenClient, getAdyenConfiguration } from './adyenv2.mock';

describe('AdyenV2ScriptLoader', () => {
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let stylesheetLoader: StylesheetLoader;
    let mockWindow: AdyenV2HostWindow;

    beforeEach(() => {
        mockWindow = {} as AdyenV2HostWindow;
        scriptLoader = {} as ScriptLoader;
        stylesheetLoader = {} as StylesheetLoader;
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, stylesheetLoader, mockWindow);
    });

    describe('#load()', () => {
        const adyenClient = getAdyenClient();
        const configuration = getAdyenConfiguration();
        const jsUrl = 'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js';
        const cssUrl =
            'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.10.1/adyen.css';
        const cssOptions = {
            prepend: false,
            attributes: {
                integrity:
                    'sha384-8ofgICZZ/k5cC5N7xegqFZOA73H9RQ7H13439JfAZW8Gj3qjuKL2isaTD3GMIhDE',
                crossorigin: 'anonymous',
            },
        };
        const jsOptions = {
            async: true,
            attributes: {
                integrity:
                    'sha384-wG2z9zSQo61EIvyXmiFCo+zB3y0ZB4hsrXVcANmpP8HLthjoQJQPBh7tZKJSV8jA',
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
            await adyenV2ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, jsOptions);
            expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, cssOptions);
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
