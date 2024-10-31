import ScriptLoader from '@bigcommerce/script-loader/lib/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { TDCustomCheckoutSDK, TdOnlineMartHostWindow } from './td-online-mart';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';
import { getTDOnlineMartClient } from './td-online-mart.mock';

describe('TDOnlineMartScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: TdOnlineMartHostWindow;
    let tdOnlineMartScriptLoader: TDOnlineMartScriptLoader;
    let tdOnlineMartClient: TDCustomCheckoutSDK;

    beforeEach(() => {
        scriptLoader = new ScriptLoader();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        mockWindow = {} as TdOnlineMartHostWindow;
        tdOnlineMartScriptLoader = new TDOnlineMartScriptLoader(scriptLoader, mockWindow);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('load method', () => {
        beforeEach(() => {
            tdOnlineMartClient = getTDOnlineMartClient();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.customcheckout = jest.fn(() => tdOnlineMartClient);

                return Promise.resolve();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('check if scriptLoader is called with proper url', async () => {
            await tdOnlineMartScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://libs.na.bambora.com/customcheckout/1/customcheckout.js',
            );
        });

        it('throw error when custom checkout does not exist on window', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.customcheckout = undefined;

                return Promise.resolve();
            });

            try {
                await tdOnlineMartScriptLoader.load();
            } catch (error) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
