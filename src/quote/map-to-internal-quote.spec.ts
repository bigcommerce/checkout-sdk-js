import { getCheckout } from '../checkout/checkouts.mock';
import { getQuote as getInternalQuote } from './internal-quotes.mock';
import mapToInternalQuote from './map-to-internal-quote';

describe('mapToInternalQuote()', () => {
    it('maps to internal quote', () => {
        expect(mapToInternalQuote(getCheckout(), getInternalQuote()))
            .toEqual(getInternalQuote());
    });
});
