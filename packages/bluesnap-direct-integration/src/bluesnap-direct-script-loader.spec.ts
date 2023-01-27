import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectScriptLoader, { BlueSnapDirectSdkEnv } from './bluesnap-direct-script-loader';
import { BlueSnapDirectHostWindow, BlueSnapDirectSdk } from './types';

describe('BlueSnapDirectScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let bsWindow: BlueSnapDirectHostWindow;
    let blueSnapDirectScriptLoader: BlueSnapDirectScriptLoader;
    let blueSnapDirectSdkMock: BlueSnapDirectSdk;

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        bsWindow = window;
        blueSnapDirectScriptLoader = new BlueSnapDirectScriptLoader(scriptLoader, bsWindow);
        blueSnapDirectSdkMock = {} as BlueSnapDirectSdk;

        jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
            bsWindow.bluesnap = blueSnapDirectSdkMock;

            return Promise.resolve();
        });
    });

    describe('#load', () => {
        it('should load the Hosted Payment Fields SDK successfully', async () => {
            const sdk = await blueSnapDirectScriptLoader.load();

            expect(sdk).toEqual(blueSnapDirectSdkMock);
        });

        it('should load the Hosted Payment Fields SDK for production', async () => {
            await blueSnapDirectScriptLoader.load();

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(BlueSnapDirectSdkEnv.PRODUCTION);
        });

        it('should load the Hosted Payment Fields SDK for sandbox', async () => {
            await blueSnapDirectScriptLoader.load(true);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(BlueSnapDirectSdkEnv.SANDBOX);
        });

        it('should fail to load the Hosted Payment Fields SDK', async () => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementationOnce(() => {
                delete bsWindow.bluesnap;

                return Promise.resolve();
            });

            const sdkPromise = blueSnapDirectScriptLoader.load();

            await expect(sdkPromise).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
