import ScriptLoader from '@bigcommerce/script-loader/lib/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { TdOnlineMartHostWindow } from './td-online-mart';
import TDOnlineMartScriptLoader from './td-online-mart-script-loader';

describe('TDOnlineMartScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let mockWindow: TdOnlineMartHostWindow;
    let tdOnlineMartScriptLoader: TDOnlineMartScriptLoader;

    beforeEach(() => {
        scriptLoader = new ScriptLoader();
        mockWindow = {} as TdOnlineMartHostWindow;
        tdOnlineMartScriptLoader = new TDOnlineMartScriptLoader(scriptLoader, mockWindow);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('load method', () => {
        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.customcheckout = jest.fn();
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('check if scriptLoader is called with proper url', async () => {
            await tdOnlineMartScriptLoader.load();

            expect(scriptLoader.loadScript).toBeCalledWith(
                'https://libs.na.bambora.com/customcheckout/1/customcheckout.js',
            );
        });

        it('throw error when chustomcheckout does not exist on window', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.customcheckout = undefined;
            });

            try {
                await tdOnlineMartScriptLoader.load();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });
});
