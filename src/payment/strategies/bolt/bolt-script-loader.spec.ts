import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { BoltCheckout, BoltDeveloperMode, BoltHostWindow } from './bolt';
import BoltScriptLoader from './bolt-script-loader';
import { getBoltScriptMock } from './bolt.mock';

describe('BoltScriptLoader', () => {
    let boltScriptLoader: BoltScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: BoltHostWindow;

    beforeEach(() => {
        mockWindow = {} as BoltHostWindow;
        scriptLoader = {} as ScriptLoader;
        boltScriptLoader = new BoltScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const publishableKey = 'publishableKey';
        let boltClient: BoltCheckout;

        beforeEach(() => {
            boltClient = getBoltScriptMock();
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.BoltCheckout = boltClient;

                return Promise.resolve();
            });
        });

        it('loads the bolt script in live mode', async () => {
            await boltScriptLoader.load(publishableKey);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect.bolt.com/connect-bigcommerce.js', expect.any(Object));
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect.bolt.com/track.js');
        });

        it('loads the bolt script in test mode', async () => {
            await boltScriptLoader.load(publishableKey, true);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-sandbox.bolt.com/connect-bigcommerce.js', expect.any(Object));
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-sandbox.bolt.com/track.js');
        });

        it('loads the bolt script in staging mode', async () => {
            await boltScriptLoader.load(publishableKey, true, { developerMode: BoltDeveloperMode.StagingMode, developerDomain: ''});

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-staging.bolt.com/connect-bigcommerce.js', expect.any(Object));
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-staging.bolt.com/track.js');
        });

        it('loads the bolt script in sandbox mode', async () => {
            await boltScriptLoader.load(publishableKey, true, { developerMode: BoltDeveloperMode.SandboxMode, developerDomain: ''});

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-sandbox.bolt.com/connect-bigcommerce.js', expect.any(Object));
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect-sandbox.bolt.com/track.js');
        });

        it('loads the bolt script in development mode', async () => {
            await boltScriptLoader.load(publishableKey, true, { developerMode: BoltDeveloperMode.DevelopmentMode, developerDomain: 'test.sample.com'});

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect.test.sample.com/connect-bigcommerce.js', expect.any(Object));
            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//connect.test.sample.com/track.js');
        });

        it('returns the Bolt Client from the window', async () => {
            const client = await boltScriptLoader.load(publishableKey);

            expect(client).toBe(boltClient);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.BoltCheckout = undefined;

                return Promise.resolve();
            });

            await expect(boltScriptLoader.load(publishableKey)).rejects.toThrow(PaymentMethodClientUnavailableError);
        });
    });
});
