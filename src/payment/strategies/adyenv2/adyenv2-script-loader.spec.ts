import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { AdyenHostWindow } from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';
import { getAdyenCheckout, getAdyenConfiguration } from './adyenv2.mock';

describe('AdyenV2ScriptLoader', () => {
    let adyenV2ScriptLoader: AdyenV2ScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: AdyenHostWindow;

    beforeEach(() => {
        mockWindow = { } as AdyenHostWindow;
        scriptLoader = {} as ScriptLoader;
        adyenV2ScriptLoader = new AdyenV2ScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const adyenClient = getAdyenCheckout();
        const configuration = getAdyenConfiguration();
        const stylesheet = document.createElement('link');
        const jsUlr = `https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.0.0/adyen.js`;

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.AdyenCheckout = jest.fn(
                    () => adyenClient
                );

                return Promise.resolve();
            });

            stylesheet.type = 'text/css';
            stylesheet.rel = 'stylesheet';
            stylesheet.href = 'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.0.0/adyen.css';

            jest.spyOn(document, 'createElement')
                .mockImplementation(() => stylesheet);

            jest.spyOn(document.head, 'appendChild')
                .mockImplementation(element => {
                    element.onload(new Event('onload'));
                });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('loads the JS and CSS', async () => {
            await adyenV2ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUlr);
            expect(document.head.appendChild).toHaveBeenCalledWith(stylesheet);
        });

        it('loads the JS and returns the existing CSS', async () => {
            await adyenV2ScriptLoader.load(configuration);
            await adyenV2ScriptLoader.load(configuration);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUlr);
            expect(document.head.appendChild).toHaveBeenCalledWith(stylesheet);
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

        it('throws an error when stylesheet is not loaded', async () => {
            jest.spyOn(document.head, 'appendChild')
                .mockImplementation(element => {
                    element.onerror(new Event('onerror'));
                });

            try {
                await adyenV2ScriptLoader.load(configuration);
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
