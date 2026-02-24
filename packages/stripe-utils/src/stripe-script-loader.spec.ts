import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeCheckoutSession,
    StripeClient,
    StripeElementsOptions,
    StripeHostWindow,
    StripeInitCheckoutOptions,
    StripeInitializationData,
    StripeJsVersion,
    StripeLoadActionsResultType,
} from './stripe';
import StripeScriptLoader from './stripe-script-loader';
import { getStripeCheckoutInstanceMock, getStripeJsMock } from './stripe.mock';

describe('StripePayScriptLoader', () => {
    let stripeScriptLoader: StripeScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: StripeHostWindow;

    const defaultInitializationData: StripeInitializationData = {
        stripePublishableKey: 'STRIPE_PUBLIC_KEY',
        stripeConnectedAccount: 'STRIPE_CONNECTED_ACCOUNT',
        shopperLanguage: 'en-US',
    };
    const defaultBetas = ['stripe_beta_feature_key_1', 'stripe_beta_feature_key_2'];
    const defaultApiVersion = '2020-03-02';

    beforeEach(() => {
        mockWindow = {} as StripeHostWindow;
        scriptLoader = {} as ScriptLoader;
        stripeScriptLoader = new StripeScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const stripeUPEJsMock = getStripeJsMock();
        const elementsOptions: StripeElementsOptions = { clientSecret: 'myToken' };

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = jest.fn(() => stripeUPEJsMock);

                return Promise.resolve();
            });
        });

        it('loads a single instance of StripeUPEClient', async () => {
            await stripeScriptLoader.getStripeClient(defaultInitializationData);
            await stripeScriptLoader.getStripeClient(defaultInitializationData);

            expect(scriptLoader.loadScript).toHaveBeenNthCalledWith(1, 'https://js.stripe.com/v3/');
        });

        it('loads a custom stripe js version', async () => {
            const stripeJsVersion = 'custom_stripe-js-version';

            await stripeScriptLoader.getStripeClient(
                defaultInitializationData,
                'en',
                stripeJsVersion,
            );

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                `https://js.stripe.com/${stripeJsVersion}/stripe.js`,
            );
        });

        it('loads a single instance of StripeElements', async () => {
            const getStripeClient = await stripeScriptLoader.getStripeClient(
                defaultInitializationData,
            );

            stripeScriptLoader.getElements(getStripeClient, elementsOptions);
            stripeScriptLoader.getElements(getStripeClient, elementsOptions);

            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = undefined;

                return Promise.resolve();
            });

            const result = stripeScriptLoader.getStripeClient(defaultInitializationData);

            await expect(result).rejects.toBeInstanceOf(StandardError);
        });
    });

    describe('#getElements', () => {
        const stripeFactoryMock = jest.fn(() => getStripeJsMock());

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = stripeFactoryMock;

                return Promise.resolve();
            });
        });

        it('get stripe client with all initialization data', async () => {
            await stripeScriptLoader.getStripeClient(
                defaultInitializationData,
                'en',
                StripeJsVersion.V3,
                defaultBetas,
                defaultApiVersion,
            );

            expect(stripeFactoryMock).toHaveBeenCalledWith('STRIPE_PUBLIC_KEY', {
                betas: defaultBetas,
                stripeAccount: 'STRIPE_CONNECTED_ACCOUNT',
                apiVersion: defaultApiVersion,
                locale: 'en',
            });
        });

        it('get stripe client without optional parameters in initialization data', async () => {
            await stripeScriptLoader.getStripeClient({
                stripePublishableKey: defaultInitializationData.stripePublishableKey,
            } as StripeInitializationData);

            expect(stripeFactoryMock).toHaveBeenCalledWith('STRIPE_PUBLIC_KEY', {});
        });
    });

    describe('#updateStripeElements', () => {
        const stripeUPEJsDefaultMock = getStripeJsMock();
        let updateMock: jest.Mock;
        let fetchUpdatesMock: jest.Mock;
        let stripeUPEJsMock: StripeClient;
        const elementsOptions: StripeElementsOptions = { clientSecret: 'myToken' };

        beforeEach(() => {
            updateMock = jest.fn();
            fetchUpdatesMock = jest.fn();
            stripeUPEJsMock = {
                ...stripeUPEJsDefaultMock,
                elements: jest.fn(() => ({
                    create: jest.fn(() => ({
                        mount: jest.fn(),
                        unmount: jest.fn(),
                        on: jest.fn(),
                        update: jest.fn(),
                        destroy: jest.fn(),
                        collapse: jest.fn(),
                    })),
                    getElement: jest.fn().mockReturnValue(null),
                    update: updateMock,
                    fetchUpdates: fetchUpdatesMock,
                })),
            };

            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = jest.fn(() => stripeUPEJsMock);

                return Promise.resolve();
            });
        });

        it('updates stripe elements', async () => {
            const getStripeClient = await stripeScriptLoader.getStripeClient(
                defaultInitializationData,
            );

            await stripeScriptLoader.getElements(getStripeClient, elementsOptions);
            await stripeScriptLoader.updateStripeElements(elementsOptions);

            expect(updateMock).toHaveBeenCalledTimes(1);
            expect(updateMock).toHaveBeenCalledWith({ clientSecret: 'myToken' });
            expect(fetchUpdatesMock).toHaveBeenCalledTimes(1);
        });

        it('does not update stripe elements if elements does not exist', async () => {
            await stripeScriptLoader.updateStripeElements(elementsOptions);

            expect(updateMock).not.toHaveBeenCalled();
            expect(fetchUpdatesMock).not.toHaveBeenCalledTimes(1);
        });
    });

    describe('#getCheckoutSession', () => {
        const stripeUPEJsDefaultMock = getStripeJsMock();
        let initCheckoutMock: jest.Mock;
        let stripeJsMock: StripeClient;
        let checkoutSessionOptions: StripeInitCheckoutOptions;
        let getSessionMock: jest.Mock;

        beforeEach(() => {
            checkoutSessionOptions = { clientSecret: 'session_id_secret_id' };
            getSessionMock = jest.fn(() =>
                Promise.resolve({ id: 'session_id' } as StripeCheckoutSession),
            );

            const checkoutSessionMock = {
                ...getStripeCheckoutInstanceMock(),
                loadActions: () =>
                    Promise.resolve({
                        type: StripeLoadActionsResultType.SUCCESS,
                        actions: {
                            updateEmail: jest.fn(),
                            getSession: getSessionMock,
                            confirm: jest.fn(),
                        },
                    }),
            };

            initCheckoutMock = jest.fn(() => Promise.resolve(checkoutSessionMock));
            stripeJsMock = {
                ...stripeUPEJsDefaultMock,
                initCheckout: initCheckoutMock,
            };
        });

        it('initializes stripe checkout once', async () => {
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);

            expect(initCheckoutMock).toHaveBeenCalledTimes(1);
            expect(initCheckoutMock).toHaveBeenCalledWith({ clientSecret: 'session_id_secret_id' });
        });

        it('reinitializes stripe checkout if checkout session id is different', async () => {
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, {
                ...checkoutSessionOptions,
                clientSecret: 'session_id_new_secret_id',
            });

            expect(initCheckoutMock).toHaveBeenCalledTimes(2);
            expect(initCheckoutMock).toHaveBeenNthCalledWith(1, {
                clientSecret: 'session_id_secret_id',
            });
            expect(initCheckoutMock).toHaveBeenNthCalledWith(2, {
                clientSecret: 'session_id_new_secret_id',
            });
        });

        it('reinitializes stripe checkout if checkout actions returns error', async () => {
            const checkoutSessionMock = {
                ...getStripeCheckoutInstanceMock(),
                loadActions: () =>
                    Promise.resolve({
                        type: StripeLoadActionsResultType.ERROR,
                        error: { message: 'checkout actions error' },
                    }),
            };

            initCheckoutMock = jest.fn(() => Promise.resolve(checkoutSessionMock));
            stripeJsMock = {
                ...stripeUPEJsDefaultMock,
                initCheckout: initCheckoutMock,
            };

            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);

            expect(initCheckoutMock).toHaveBeenCalledTimes(2);
            expect(initCheckoutMock).toHaveBeenNthCalledWith(1, {
                clientSecret: 'session_id_secret_id',
            });
            expect(initCheckoutMock).toHaveBeenNthCalledWith(2, {
                clientSecret: 'session_id_secret_id',
            });
        });

        it('reinitializes stripe checkout if checkout actions not exists', async () => {
            const checkoutSessionMock = {
                ...getStripeCheckoutInstanceMock(),
                loadActions: () =>
                    Promise.resolve({
                        type: StripeLoadActionsResultType.SUCCESS,
                    }),
            };

            initCheckoutMock = jest.fn(() => Promise.resolve(checkoutSessionMock));
            stripeJsMock = {
                ...stripeUPEJsDefaultMock,
                initCheckout: initCheckoutMock,
            };

            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);

            expect(initCheckoutMock).toHaveBeenCalledTimes(2);
            expect(initCheckoutMock).toHaveBeenNthCalledWith(1, {
                clientSecret: 'session_id_secret_id',
            });
            expect(initCheckoutMock).toHaveBeenNthCalledWith(2, {
                clientSecret: 'session_id_secret_id',
            });
        });

        it('reinitializes stripe checkout if checkout session is not different', async () => {
            getSessionMock = jest.fn(() => Promise.resolve(undefined));

            const checkoutSessionMock = {
                ...getStripeCheckoutInstanceMock(),
                loadActions: () =>
                    Promise.resolve({
                        type: StripeLoadActionsResultType.SUCCESS,
                        actions: {
                            updateEmail: jest.fn(),
                            getSession: getSessionMock,
                            confirm: jest.fn(),
                        },
                    }),
            };

            initCheckoutMock = jest.fn(() => Promise.resolve(checkoutSessionMock));
            stripeJsMock = {
                ...stripeUPEJsDefaultMock,
                initCheckout: initCheckoutMock,
            };

            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, {
                ...checkoutSessionOptions,
                clientSecret: 'session_id_new_secret_id',
            });

            expect(initCheckoutMock).toHaveBeenCalledTimes(2);
            expect(initCheckoutMock).toHaveBeenNthCalledWith(1, {
                clientSecret: 'session_id_secret_id',
            });
            expect(initCheckoutMock).toHaveBeenNthCalledWith(2, {
                clientSecret: 'session_id_new_secret_id',
            });
        });

        it('reinitializes stripe checkout if stripe throw an unexpected error', async () => {
            getSessionMock = jest.fn(() => Promise.resolve(undefined));

            const checkoutSessionMock = {
                ...getStripeCheckoutInstanceMock(),
                loadActions: () =>
                    Promise.reject({
                        type: StripeLoadActionsResultType.ERROR,
                        message: 'unexpected error',
                    }),
            };

            initCheckoutMock = jest.fn(() => Promise.resolve(checkoutSessionMock));
            stripeJsMock = {
                ...stripeUPEJsDefaultMock,
                initCheckout: initCheckoutMock,
            };

            await stripeScriptLoader.getStripeCheckout(stripeJsMock, checkoutSessionOptions);
            await stripeScriptLoader.getStripeCheckout(stripeJsMock, {
                ...checkoutSessionOptions,
                clientSecret: 'session_id_new_secret_id',
            });

            expect(initCheckoutMock).toHaveBeenCalledTimes(2);
            expect(initCheckoutMock).toHaveBeenNthCalledWith(1, {
                clientSecret: 'session_id_secret_id',
            });
            expect(initCheckoutMock).toHaveBeenNthCalledWith(2, {
                clientSecret: 'session_id_new_secret_id',
            });
        });
    });
});
