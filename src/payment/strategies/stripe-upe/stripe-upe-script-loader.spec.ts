import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { StripeHostWindow } from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { getStripeUPEJsMock } from './stripe-upe.mock';

describe('StripeUPEPayScriptLoader', () => {
    let stripeUPEScriptLoader: StripeUPEScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: StripeHostWindow;

    beforeEach(() => {
        mockWindow = { } as StripeHostWindow;
        scriptLoader = {} as ScriptLoader;
        stripeUPEScriptLoader = new StripeUPEScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const stripeUPEJsMock = getStripeUPEJsMock();

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = jest.fn(() => stripeUPEJsMock);

                return Promise.resolve();
            });
        });

        it('loads the JS', async () => {
            await stripeUPEScriptLoader.load(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT'
            );

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://js.stripe.com/v3/');
        });

        it('returns the JS from the window', async () => {
            const stripeJs = await stripeUPEScriptLoader.load(
                'STRIPE_PUBLIC_KEY',
                'STRIPE_CONNECTED_ACCOUNT'
            );

            expect(stripeJs).toBe(stripeUPEJsMock);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = undefined;

                return Promise.resolve();
            });

            try {
                await stripeUPEScriptLoader.load(
                    'STRIPE_PUBLIC_KEY',
                    'STRIPE_CONNECTED_ACCOUNT'
                );
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });
    });
});
