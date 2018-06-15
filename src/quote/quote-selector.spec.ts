import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import createInternalCheckoutSelectors from '../checkout/create-internal-checkout-selectors';

import { getQuote } from './internal-quotes.mock';
import QuoteSelector from './quote-selector';

describe('QuoteSelector', () => {
    let quoteSelector;
    let state;

    beforeEach(() => {
        state = getCheckoutStoreState();
        quoteSelector = new QuoteSelector(createInternalCheckoutSelectors(state));
    });

    describe('#getQuote()', () => {
        it('returns the internal quote', () => {
            expect(quoteSelector.getQuote())
                .toEqual(getQuote());
        });
    });

    describe('#getLoadError()', () => {
        it('does not returns error if able to load', () => {
            expect(quoteSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns false if not loading quote', () => {
            expect(quoteSelector.isLoading()).toEqual(false);
        });
    });
});
