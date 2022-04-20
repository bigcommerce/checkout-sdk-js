import { createScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { getCardinalScriptMock } from './cardinal.mock';
import { CardinalScriptLoader, CardinalWindow } from './index';

describe('CardinalScriptLoader', () => {
    const cardinalWindow: CardinalWindow = window;
    const scriptLoader = createScriptLoader();
    const scriptMock = getCardinalScriptMock();
    let cardinalScriptLoader: CardinalScriptLoader;

    beforeEach(() => {
        cardinalScriptLoader = new CardinalScriptLoader(scriptLoader, cardinalWindow);
        jest.spyOn(scriptLoader, 'loadScript').mockReturnValue(Promise.resolve(true));
    });

    it('loads widget test script', () => {
        const testMode = true;
        cardinalScriptLoader.load('provider', testMode);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js?v=provider'
        );
    });

    it('loads widget production script', () => {
        const testMode = false;
        cardinalScriptLoader.load('provider', testMode);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://songbird.cardinalcommerce.com/edge/v1/songbird.js?v=provider'
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
