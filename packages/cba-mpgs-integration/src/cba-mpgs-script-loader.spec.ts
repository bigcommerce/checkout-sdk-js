import { ScriptLoader } from '@bigcommerce/script-loader';

import { CBAMPGSHostWindow, ThreeDSjs } from './cba-mpgs';
import CBAMPGSScriptLoader from './cba-mpgs-script-loader';
import { getCBAMPGSScriptMock } from './cba-mpgs.mock';

describe('CBAMPGSScriptLoader', () => {
    let cbaMPGSScriptLoader: CBAMPGSScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: CBAMPGSHostWindow;

    beforeEach(() => {
        mockWindow = {} as CBAMPGSHostWindow;
        scriptLoader = {} as ScriptLoader;
        cbaMPGSScriptLoader = new CBAMPGSScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let threeDsScript: ThreeDSjs;

        beforeEach(() => {
            threeDsScript = getCBAMPGSScriptMock();

            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.ThreeDS = threeDsScript;

                return Promise.resolve();
            });
        });

        it('loads the Script', async () => {
            await cbaMPGSScriptLoader.load(false);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                '//ap-gateway.mastercard.com/static/threeDS/1.3.0/three-ds.min.js',
            );
        });

        it('returns the Script from the window', async () => {
            const ThreeDSjs = await cbaMPGSScriptLoader.load();

            expect(ThreeDSjs).toBe(threeDsScript);
        });

        describe('when testMode is on', () => {
            it('loads the Script in sandbox mode', async () => {
                await cbaMPGSScriptLoader.load(true);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//test-gateway.mastercard.com/static/threeDS/1.3.0/three-ds.min.js',
                );
            });

            it('returns the Script from the window', async () => {
                const ThreeDSjs = await cbaMPGSScriptLoader.load(true);

                expect(ThreeDSjs).toBe(threeDsScript);
            });
        });
    });
});
