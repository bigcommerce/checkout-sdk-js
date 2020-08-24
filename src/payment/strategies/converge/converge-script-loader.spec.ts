import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { ConvergeHostWindow } from './converge';
import ConvergeScriptLoader from './converge-script-loader';
import { getConvergeMock } from './converge.mock';

describe('ConvergeScriptLoader', () => {
    let convergeScriptLoader: ConvergeScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: ConvergeHostWindow;

    beforeEach(() => {
        mockWindow = {} as ConvergeHostWindow;
        scriptLoader = {} as ScriptLoader;
        convergeScriptLoader = new ConvergeScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const convergeMock = getConvergeMock();

        const sdk3DS2 = 'https://uat.gw.fraud.eu.elavonaws.com/sdk-web-js/0.13.2/3ds2-web-sdk.min.js';
        const libUrl = 'https://libs.fraud.elavon.com/sdk-web-js/0.12.0/3ds2-web-sdk.min.js';

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Elavon3DSWebSDK = jest.fn(() => convergeMock);

                return Promise.resolve();
            });
        });

        it('loads the JS', async () => {
            await convergeScriptLoader.load('token');

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(libUrl);
            expect(scriptLoader.loadScript).toHaveBeenCalledWith(sdk3DS2);
        });

        it('returns the JS from the window', async () => {
            const convergeJs = await convergeScriptLoader.load('token');

            expect(convergeJs).toBe(convergeMock);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Elavon3DSWebSDK = undefined;

                return Promise.resolve();
            });

            await expect(convergeScriptLoader.load('token')).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
