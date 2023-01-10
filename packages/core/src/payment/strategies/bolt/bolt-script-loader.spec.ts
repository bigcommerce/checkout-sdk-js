import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { BoltCheckout, BoltDeveloperMode, BoltEmbedded, BoltHostWindow } from './bolt';
import BoltScriptLoader from './bolt-script-loader';
import { getBoltClientScriptMock, getBoltEmbeddedScriptMock } from './bolt.mock';

describe('BoltScriptLoader', () => {
    let boltScriptLoader: BoltScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: BoltHostWindow;

    const expectedScriptOptions = (id: string, publishableKey?: string) => {
        return expect.objectContaining({
            attributes: expect.objectContaining({
                id,
                'data-publishable-key': publishableKey,
            }),
        });
    };

    beforeEach(() => {
        mockWindow = {} as BoltHostWindow;
        scriptLoader = {} as ScriptLoader;
        boltScriptLoader = new BoltScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const publishableKey = 'publishableKey';
        let boltClient: BoltCheckout;
        let boltEmbedded: BoltEmbedded;

        describe('loads BoltClient', () => {
            beforeEach(() => {
                boltClient = getBoltClientScriptMock();
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.BoltCheckout = boltClient;

                    return Promise.resolve();
                });
            });

            it('loads the bolt client script in live mode', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.bolt.com/connect-bigcommerce.js',
                    expectedScriptOptions('bolt-connect', publishableKey),
                );
                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.bolt.com/track.js',
                    expectedScriptOptions('bolt-track', publishableKey),
                );
            });

            it('loads the bolt client script in test mode', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey, true);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/connect-bigcommerce.js',
                    expectedScriptOptions('bolt-connect', publishableKey),
                );
                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/track.js',
                    expectedScriptOptions('bolt-track', publishableKey),
                );
            });

            it('loads the bolt client script in staging mode', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey, true, {
                    developerMode: BoltDeveloperMode.StagingMode,
                    developerDomain: '',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-staging.bolt.com/connect-bigcommerce.js',
                    expectedScriptOptions('bolt-connect', publishableKey),
                );
                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-staging.bolt.com/track.js',
                    expectedScriptOptions('bolt-track', publishableKey),
                );
            });

            it('loads the bolt client script in sandbox mode', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey, true, {
                    developerMode: BoltDeveloperMode.SandboxMode,
                    developerDomain: '',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/connect-bigcommerce.js',
                    expect.any(Object),
                );
                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/track.js',
                    expectedScriptOptions('bolt-track', publishableKey),
                );
            });

            it('loads the bolt client script in development mode', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey, true, {
                    developerMode: BoltDeveloperMode.DevelopmentMode,
                    developerDomain: 'test.sample.com',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.test.sample.com/connect-bigcommerce.js',
                    expect.any(Object),
                );
                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.test.sample.com/track.js',
                    expectedScriptOptions('bolt-track', publishableKey),
                );
            });

            it('returns the BoltClient from the window', async () => {
                const client = await boltScriptLoader.loadBoltClient(publishableKey);

                expect(client).toBe(boltClient);
            });

            it('returns the Bolt Client from the window if it is already exist without provided publishableKey', async () => {
                await boltScriptLoader.loadBoltClient(publishableKey);

                const client = await boltScriptLoader.loadBoltClient();

                expect(client).toBe(boltClient);
            });

            it('throws an error when window is not set', async () => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.BoltCheckout = undefined;

                    return Promise.resolve();
                });

                await expect(boltScriptLoader.loadBoltClient(publishableKey)).rejects.toThrow(
                    PaymentMethodClientUnavailableError,
                );
            });

            it('throws an error when window is not set', async () => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.BoltCheckout = undefined;

                    return Promise.resolve();
                });

                await expect(boltScriptLoader.loadBoltClient(publishableKey)).rejects.toThrow(
                    PaymentMethodClientUnavailableError,
                );
            });
        });

        describe('loads BoltEmbedded', () => {
            beforeEach(() => {
                boltEmbedded = getBoltEmbeddedScriptMock();
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.Bolt = () => boltEmbedded;

                    return Promise.resolve();
                });
            });

            it('loads the bolt embedded script in live mode', async () => {
                await boltScriptLoader.loadBoltEmbedded(publishableKey);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.bolt.com/embed.js',
                    expect.any(Object),
                );
            });

            it('loads the bolt embedded script in test mode', async () => {
                await boltScriptLoader.loadBoltEmbedded(publishableKey, true);

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/embed.js',
                    expect.any(Object),
                );
            });

            it('loads the bolt embedded script in staging mode', async () => {
                await boltScriptLoader.loadBoltEmbedded(publishableKey, true, {
                    developerMode: BoltDeveloperMode.StagingMode,
                    developerDomain: '',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-staging.bolt.com/embed.js',
                    expect.any(Object),
                );
            });

            it('loads the bolt embedded script in sandbox mode', async () => {
                await boltScriptLoader.loadBoltEmbedded(publishableKey, true, {
                    developerMode: BoltDeveloperMode.SandboxMode,
                    developerDomain: '',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect-sandbox.bolt.com/embed.js',
                    expect.any(Object),
                );
            });

            it('loads the bolt embedded script in development mode', async () => {
                await boltScriptLoader.loadBoltEmbedded(publishableKey, true, {
                    developerMode: BoltDeveloperMode.DevelopmentMode,
                    developerDomain: 'test.sample.com',
                });

                expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                    '//connect.test.sample.com/embed.js',
                    expect.any(Object),
                );
            });

            it('returns the BoltEmbedded from the window', async () => {
                const client = await boltScriptLoader.loadBoltEmbedded(publishableKey);

                expect(client).toBe(boltEmbedded);
            });

            it('throws an error when window is not set', async () => {
                scriptLoader.loadScript = jest.fn(() => {
                    mockWindow.Bolt = undefined;

                    return Promise.resolve();
                });

                await expect(boltScriptLoader.loadBoltEmbedded(publishableKey)).rejects.toThrow(
                    PaymentMethodClientUnavailableError,
                );
            });
        });
    });
});
