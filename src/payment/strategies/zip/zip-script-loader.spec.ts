import { ScriptLoader } from '@bigcommerce/script-loader';

import { Zip, ZipHostWindow } from './zip';
import ZipScriptLoader from './zip-script-loader';
import { getZipScriptMock } from './zip.mock';

describe('ZipScriptLoader', () => {
    let zipScriptLoader: ZipScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: ZipHostWindow;

    beforeEach(() => {
        mockWindow = {} as ZipHostWindow;
        scriptLoader = {} as ScriptLoader;
        zipScriptLoader = new ZipScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let zipScript: Zip;

        beforeEach(() => {
            zipScript = getZipScriptMock('approved');

            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Zip = zipScript;

                return Promise.resolve();
            });
        });

        it('loads the script', async () => {
            await zipScriptLoader.load();
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//static.zipmoney.com.au/checkout/checkout-v1.min.js');
        });

        it('returns the script from the window', async () => {
            const Zip = await zipScriptLoader.load();
            expect(Zip).toBe(zipScript);
        });
    });
});
