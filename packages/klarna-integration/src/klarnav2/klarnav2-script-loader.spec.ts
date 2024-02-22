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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/naming-convention
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
            });

            try {
                await klarnav2ScriptLoader.load();
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
