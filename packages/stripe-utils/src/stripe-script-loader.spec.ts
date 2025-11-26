import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    StripeClient,
    StripeElementsOptions,
    StripeHostWindow,
    StripeInitializationData,
} from './stripe';
import StripeScriptLoader from './stripe-script-loader';
import { getStripeJsMock } from './stripe.mock';

describe('StripePayScriptLoader', () => {
    let stripeUPEScriptLoader: StripeScriptLoader;
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
        stripeUPEScriptLoader = new StripeScriptLoader(scriptLoader, mockWindow);
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
            await stripeUPEScriptLoader.getStripeClient(defaultInitializationData);
            await stripeUPEScriptLoader.getStripeClient(defaultInitializationData);

            expect(scriptLoader.loadScript).toHaveBeenNthCalledWith(1, 'https://js.stripe.com/v3/');
        });

        it('loads a single instance of StripeElements', async () => {
            const getStripeClient = await stripeUPEScriptLoader.getStripeClient(
                defaultInitializationData,
            );

            stripeUPEScriptLoader.getElements(getStripeClient, elementsOptions);
            stripeUPEScriptLoader.getElements(getStripeClient, elementsOptions);

            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = undefined;

                return Promise.resolve();
            });

            const result = stripeUPEScriptLoader.getStripeClient(defaultInitializationData);

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
            await stripeUPEScriptLoader.getStripeClient(
                defaultInitializationData,
                'en',
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
            await stripeUPEScriptLoader.getStripeClient({
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
            const getStripeClient = await stripeUPEScriptLoader.getStripeClient(
                defaultInitializationData,
            );

            await stripeUPEScriptLoader.getElements(getStripeClient, elementsOptions);
            await stripeUPEScriptLoader.updateStripeElements(elementsOptions);

            expect(updateMock).toHaveBeenCalledTimes(1);
            expect(updateMock).toHaveBeenCalledWith({ clientSecret: 'myToken' });
            expect(fetchUpdatesMock).toHaveBeenCalledTimes(1);
        });

        it('does not update stripe elements if elements does not exist', async () => {
            await stripeUPEScriptLoader.updateStripeElements(elementsOptions);

            expect(updateMock).not.toHaveBeenCalled();
            expect(fetchUpdatesMock).not.toHaveBeenCalledTimes(1);
        });
    });
});
