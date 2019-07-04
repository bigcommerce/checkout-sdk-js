import { createScriptLoader } from '@bigcommerce/script-loader';

import { StandardError } from '../../../common/error/errors';

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
        cardinalScriptLoader.load(testMode);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js'
        );
    });

    it('loads widget production script', () => {
        const testMode = false;
        cardinalScriptLoader.load(testMode);

        expect(scriptLoader.loadScript).toHaveBeenCalledWith(
            'https://songbird.cardinalcommerce.com/edge/v1/songbird.js'
        );
    });

    it('returns script from the window', async () => {
        scriptLoader.loadScript = jest.fn(() => {
            cardinalWindow.Cardinal = scriptMock.Cardinal;

            return Promise.resolve();
        });

        const script = await cardinalScriptLoader.load();
        expect(script).toBe(cardinalWindow.Cardinal);
    });

    it('throws error to inform that order finalization is not required', async () => {
        scriptLoader.loadScript = jest.fn(() => {
            throw new StandardError();
        });

        try {
            await cardinalScriptLoader.load();
        } catch (error) {
            expect(error).toBeInstanceOf(StandardError);
        }
    });
});
