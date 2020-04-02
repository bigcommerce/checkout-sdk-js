import { ScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

import { StripeHostWindow } from './stripev3';
import StripeV3ScriptLoader from './stripev3-script-loader';
import { getStripeV3JsMock } from './stripev3.mock';

describe('StripeV3PayScriptLoader', () => {
    let stripeV3ScriptLoader: StripeV3ScriptLoader;
    let scriptLoader: ScriptLoader;
    let mockWindow: StripeHostWindow;

    beforeEach(() => {
        mockWindow = { } as StripeHostWindow;
        scriptLoader = {} as ScriptLoader;
        stripeV3ScriptLoader = new StripeV3ScriptLoader(scriptLoader, mockWindow);
    });

    describe('#load()', () => {
        const stripeV3JsMock = getStripeV3JsMock();

        beforeEach(() => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = jest.fn(() => stripeV3JsMock);

                return Promise.resolve();
            });
        });

        it('loads the JS', async () => {
            await stripeV3ScriptLoader.load('publishableKey', 'stripeAccount');

            expect(scriptLoader.loadScript).toHaveBeenCalledWith('https://js.stripe.com/v3/');
        });

        it('returns the JS from the window', async () => {
            const stripeJs = await stripeV3ScriptLoader.load('publishableKey', 'stripeAccount');

            expect(stripeJs).toBe(stripeV3JsMock);
        });

        it('throws an error when window is not set', async () => {
            scriptLoader.loadScript = jest.fn(() => {
                mockWindow.Stripe = undefined;

                return Promise.resolve();
            });

            try {
                await stripeV3ScriptLoader.load('publishableKey', 'stripeAccount');
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
            }
        });
    });
});
