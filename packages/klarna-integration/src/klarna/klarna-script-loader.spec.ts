import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaScriptLoader from './klarna-script-loader';
import KlarnaWindow from './klarna-window';

describe('KlarnaScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: KlarnaWindow;
    let klarnaScriptLoader: KlarnaScriptLoader;

    beforeEach(() => {
        scriptLoader = new ScriptLoader();
        mockWindow = { Klarna: {} } as KlarnaWindow;
        klarnaScriptLoader = new KlarnaScriptLoader(scriptLoader, mockWindow);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('load method', () => {
        beforeEach(() => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
                if (mockWindow.Klarna) {
                    mockWindow.Klarna.Credit = {
                        authorize: jest.fn(),
                        init: jest.fn(),
                        load: jest.fn(),
                    };
                }

                return Promise.resolve();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('check if scriptLoader is called with proper url', async () => {
            await klarnaScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                '//credit.klarnacdn.net/lib/v1/api.js',
            );
        });

        it('throw error when custom checkout does not exist on window', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Klarna = undefined;

                return Promise.resolve();
            });

            try {
                await klarnaScriptLoader.load();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
