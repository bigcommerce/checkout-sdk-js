import { ScriptLoader, StylesheetLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdyenV3HostWindow } from '../types';

import AdyenV3ScriptLoader from './adyenv3-script-loader';
import { getAdyenClient, getAdyenConfiguration } from './adyenv3.mock';

describe('AdyenV3ScriptLoader', () => {
    let adyenV3ScriptLoader: AdyenV3ScriptLoader;
    let scriptLoader: ScriptLoader;
    let stylesheetLoader: StylesheetLoader;
    let mockWindow: AdyenV3HostWindow;

    beforeEach(() => {
        mockWindow = {} as AdyenV3HostWindow;
        scriptLoader = {} as ScriptLoader;
        stylesheetLoader = {} as StylesheetLoader;
        adyenV3ScriptLoader = new AdyenV3ScriptLoader(scriptLoader, stylesheetLoader, mockWindow);
    });

    describe('#load()', () => {
        const adyenClient = getAdyenClient();
        const configuration = getAdyenConfiguration();
        const configurationWithClientKey = getAdyenConfiguration();

        afterEach(() => {
            jest.restoreAllMocks();
        });

        describe('when the PI-5661.adyen_sdk_upgrade experiment is disabled', () => {
            const jsUrl =
                'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/5.71.1/adyen.js';
            const cssUrl =
                'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/5.71.1/adyen.css';
            const cssOptions = {
                prepend: false,
                attributes: {
                    integrity:
                        'sha384-5MvB4RnzvviA3VBT4KYABZ4HXNZG5LRqREEgd41xt/pf/QvKmsj2O9GuNuywRXx9',
                    crossorigin: 'anonymous',
                },
            };
            const jsOptions = {
                async: true,
                attributes: {
                    integrity:
                        'sha384-yvY2yFNR4WqIjPqP9MzjI+gJimmaJnAvj4rLHKvgJbgFD5fMuf8zIJrFJOW8Lhhf',
                    crossorigin: 'anonymous',
                },
            };

            beforeEach(() => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.AdyenCheckout = jest.fn(() => Promise.resolve(adyenClient));

                    return Promise.resolve();
                });

                stylesheetLoader.loadStylesheet = jest.fn(() => Promise.resolve());
            });

            it('loads the legacy JS and CSS', async () => {
                await adyenV3ScriptLoader.load(configuration);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, jsOptions);
                expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, cssOptions);
            });

            it('returns the JS from the window using originKey', async () => {
                const adyenJs = await adyenV3ScriptLoader.load(configuration);

                expect(adyenJs).toBe(adyenClient);
            });

            it('returns the JS from the window using clientKey', async () => {
                const adyenJs = await adyenV3ScriptLoader.load(configurationWithClientKey);

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

        describe('when the PI-5661.adyen_sdk_upgrade experiment is enabled', () => {
            const jsUrl =
                'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/6.44.0/adyen.js';
            const cssUrl =
                'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/6.44.0/adyen.css';
            const cssOptions = {
                prepend: false,
                attributes: {
                    integrity:
                        'sha384-PWrMXiOTu6vDvUL+llWHVeWnBIxMTJ6PxGu6f8gKPGpoklzxJxRmeuOgVHE8Xk5U',
                    crossorigin: 'anonymous',
                },
            };
            const jsOptions = {
                async: true,
                attributes: {
                    integrity:
                        'sha384-eFpi7m7SawN2cMRhljHMUvdeYR9Hi6dWhw40OEHv5HNavDq6Gdhsnch9FcdU3+JZ',
                    crossorigin: 'anonymous',
                },
            };

            beforeEach(() => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.AdyenWeb = {
                        AdyenCheckout: jest.fn(() => Promise.resolve(adyenClient)),
                        createComponent: jest.fn(),
                    };

                    return Promise.resolve();
                });

                stylesheetLoader.loadStylesheet = jest.fn(() => Promise.resolve());
            });

            it('loads the upgraded JS and CSS', async () => {
                await adyenV3ScriptLoader.load(configuration, true);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(jsUrl, jsOptions);
                expect(stylesheetLoader.loadStylesheet).toHaveBeenCalledWith(cssUrl, cssOptions);
            });

            it('returns the JS from the window using originKey', async () => {
                const adyenJs = await adyenV3ScriptLoader.load(configuration, true);

                expect(adyenJs).toBe(adyenClient);
            });

            it('returns the JS from the window using clientKey', async () => {
                const adyenJs = await adyenV3ScriptLoader.load(configurationWithClientKey, true);

                expect(adyenJs).toBe(adyenClient);
            });

            it('throws an error when window is not set', async () => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.AdyenWeb = undefined;

                    return Promise.resolve();
                });

                try {
                    await adyenV3ScriptLoader.load(configuration, true);
                } catch (error) {
                    expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
                }
            });

            it('attaches a createComponent method that delegates to window.AdyenWeb.createComponent', async () => {
                const adyenJs = await adyenV3ScriptLoader.load(configuration, true);
                const componentOptions = { onChange: jest.fn() };

                adyenJs.createComponent?.('scheme', componentOptions);

                expect(mockWindow.AdyenWeb?.createComponent).toHaveBeenCalledWith(
                    'scheme',
                    adyenJs,
                    componentOptions,
                );
            });
        });
    });
});
