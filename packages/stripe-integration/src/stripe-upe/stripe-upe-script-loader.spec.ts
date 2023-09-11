import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { StripeElementsOptions, StripeHostWindow } from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { getStripeUPEJsMock } from './stripe-upe.mock';

describe('StripeUPEPayScriptLoader', () => {
    let stripeUPEScriptLoader: StripeUPEScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: StripeHostWindow;

    beforeEach(() => {
        mockWindow = {} as StripeHostWindow;
        scriptLoader = {} as ScriptLoader;
        stripeUPEScriptLoader = new StripeUPEScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const stripeUPEJsMock = getStripeUPEJsMock();
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

            await stripeUPEScriptLoader.getElements(getStripeClient, elementsOptions);
            await stripeUPEScriptLoader.getElements(getStripeClient, elementsOptions);

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
});
