import { ScriptLoader } from '@bigcommerce/script-loader';

import { Quadpay, QuadpayHostWindow } from './quadpay';
import QuadpayScriptLoader from './quadpay-script-loader';
import { getQuadpayScriptMock } from './quadpay.mock';

describe('QuadpayScriptLoader', () => {
    let quadpayScriptLoader: QuadpayScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: QuadpayHostWindow;

    beforeEach(() => {
        mockWindow = {} as QuadpayHostWindow;
        scriptLoader = {} as ScriptLoader;
        quadpayScriptLoader = new QuadpayScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let quadpayScript: Quadpay;

        beforeEach(() => {
            quadpayScript = getQuadpayScriptMock('approved');

            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Quadpay = quadpayScript;

                return Promise.resolve();
            });
        });

        it('loads the script', async () => {
            await quadpayScriptLoader.load();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//static.zipmoney.com.au/checkout/checkout-v1.min.js');
        });

        it('returns the script from the window', async () => {
            const Quadpay = await quadpayScriptLoader.load();
            expect(Quadpay).toBe(quadpayScript);
        });
    });
});
