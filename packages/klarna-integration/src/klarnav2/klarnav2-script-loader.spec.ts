import ScriptLoader from '@bigcommerce/script-loader/lib/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2Window from './klarnav2-window';

describe('KlarnaV2ScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: KlarnaV2Window;
    let klarnav2ScriptLoader: KlarnaV2ScriptLoader;

    beforeEach(() => {
        scriptLoader = new ScriptLoader();
        mockWindow = { Klarna: {} } as KlarnaV2Window;
        klarnav2ScriptLoader = new KlarnaV2ScriptLoader(scriptLoader, mockWindow);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('load method', () => {
        beforeEach(() => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
                if (mockWindow.Klarna) {
                    mockWindow.Klarna.Payments = {
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
            await klarnav2ScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://x.klarnacdn.net/kp/lib/v1/api.js',
            );
        });

        it('throw error when custom checkout does not exist on window', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Klarna = undefined;

                return Promise.resolve();
            });

            try {
                await klarnav2ScriptLoader.load();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
