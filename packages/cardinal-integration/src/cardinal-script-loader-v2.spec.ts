import { createScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCardinalScriptMock } from './cardinal.mock';

import { CardinalScriptLoaderV2, CardinalWindow } from './index';

describe('CardinalScriptLoaderV2', () => {
    const cardinalWindow: CardinalWindow = window;
    const scriptLoader = createScriptLoader();
    const scriptMock = getCardinalScriptMock();
    const loadScript = jest.spyOn(scriptLoader, 'loadScript');
    let cardinalScriptLoader: CardinalScriptLoaderV2;

    beforeEach(() => {
        cardinalScriptLoader = new CardinalScriptLoaderV2(scriptLoader, cardinalWindow);
    });

    it('loads the updated test script when the experiment is on', () => {
        cardinalScriptLoader.load('provider', true, true);

        expect(loadScript).toHaveBeenCalledWith(
            'https://cas.static.client.cardinaltrusted.com/songbird/v2.0.0/songbird.js?v=provider',
        );
    });

    it('loads the default test script when the experiment is off', () => {
        cardinalScriptLoader.load('provider', true, false);

        expect(loadScript).toHaveBeenCalledWith(
            'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js?v=provider',
        );
    });

    it('loads the production script when test mode is off', () => {
        cardinalScriptLoader.load('provider', false, true);

        expect(loadScript).toHaveBeenCalledWith(
            'https://static.client.cardinaltrusted.com/songbird/v2.0.0/songbird.js?v=provider',
        );
    });

    it('returns script from the window', async () => {
        scriptLoader.loadScript = jest.fn(() => {
            cardinalWindow.Cardinal = scriptMock.Cardinal;

            return Promise.resolve();
        });

        const script = await cardinalScriptLoader.load('provider');

        expect(script).toBe(cardinalWindow.Cardinal);
    });

    it('throws error to inform that order finalization is not required', async () => {
        scriptLoader.loadScript = jest.fn(() => {
            throw new PaymentMethodClientUnavailableError();
        });

        try {
            await cardinalScriptLoader.load('provider');
        } catch (error) {
            expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
        }
    });
});
