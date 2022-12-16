import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import SquareV2ScriptLoader, { SquareV2WebPaymentsSdkEnv } from './squarev2-script-loader';
import { Square } from './types';

describe('SquareV2ScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let squarev2ScriptLoader: SquareV2ScriptLoader;
    let squarev2SdkMock: Square;

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        squarev2ScriptLoader = new SquareV2ScriptLoader(scriptLoader);
        squarev2SdkMock = {} as Square;

        jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
            window.Square = squarev2SdkMock;

            return Promise.resolve();
        });
    });

    describe('#load', () => {
        it('should load the Web Payments SDK successfully', async () => {
            const sdk = await squarev2ScriptLoader.load();

            expect(sdk).toEqual(squarev2SdkMock);
        });

        it('should load the Web Payments SDK from the live url', async () => {
            await squarev2ScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(SquareV2WebPaymentsSdkEnv.LIVE);
        });

        it('should load the Web Payments SDK from the sandbox url', async () => {
            await squarev2ScriptLoader.load(true);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(SquareV2WebPaymentsSdkEnv.SANDBOX);
        });

        it('should fail to load the Web Payments SDK', () => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementationOnce(() => {
                delete window.Square;

                return Promise.resolve();
            });

            const sdkPromise = squarev2ScriptLoader.load();

            expect(sdkPromise).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
