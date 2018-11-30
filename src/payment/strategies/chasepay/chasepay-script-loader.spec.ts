import { ScriptLoader } from '@bigcommerce/script-loader';

import { ChasePayHostWindow, JPMC } from './chasepay';
import ChasePayScriptLoader from './chasepay-script-loader';
import { getChasePayScriptMock } from './chasepay.mock';

describe('ChasePayScriptLoader', () => {
    let chasePayScriptLoader: ChasePayScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: ChasePayHostWindow;

    beforeEach(() => {
        mockWindow = {} as ChasePayHostWindow;
        scriptLoader = {} as ScriptLoader;
        chasePayScriptLoader = new ChasePayScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        let chasePayScript: JPMC;

        beforeEach(() => {
            chasePayScript = getChasePayScriptMock();

            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.JPMC = chasePayScript;

                return Promise.resolve();
            });
        });

        it('loads the Script', async () => {
            await chasePayScriptLoader.load(false);
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//pwc.chase.com/pwc/checkout/js/v20170521/list.action?type=raw&applId=PWC&channelId=CWC&version=1');
        });

        it('returns the Script from the window', async () => {
            const JPMC = await chasePayScriptLoader.load();
            expect(JPMC).toBe(chasePayScript);
        });

        describe('when testMode is on', () => {
            it('loads the Script in sandbox mode', async () => {
                await chasePayScriptLoader.load(true);
                expect(scriptLoader.loadScript).toHaveBeenCalledWith('//pwcpsb.chase.com/pwc/checkout/js/v20170521/list.action?type=raw&applId=PWC&channelId=CWC&version=1');
            });

            it('returns the Script from the window', async () => {
                const JPMC = await chasePayScriptLoader.load(true);
                expect(JPMC).toBe(chasePayScript);
            });
        });
    });
});
