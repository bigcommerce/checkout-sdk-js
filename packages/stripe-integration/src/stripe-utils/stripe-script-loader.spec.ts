import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripeClient, StripeElementsOptions, StripeHostWindow } from './stripe';
import StripeScriptLoader from './stripe-script-loader';
import { getStripeJsMock } from './stripe.mock';

describe('StripePayScriptLoader', () => {
    let stripeUPEScriptLoader: StripeScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: StripeHostWindow;

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
            await stripeUPEScriptLoader.getStripeClient(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT',
            );
            await stripeUPEScriptLoader.getStripeClient(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT',
            );

            expect(scriptLoader.loadScript).toHaveBeenNthCalledWith(1, 'https://js.stripe.com/v3/');
        });

        it('loads a single instance of StripeElements', async () => {
            const getStripeClient = await stripeUPEScriptLoader.getStripeClient(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT',
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

            const result = stripeUPEScriptLoader.getStripeClient(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT',
            );

            await expect(result).rejects.toBeInstanceOf(StandardError);
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
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT',
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
