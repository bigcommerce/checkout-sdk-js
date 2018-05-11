import { getQuoteState } from './internal-quotes.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import QuoteSelector from './quote-selector';

describe('QuoteSelector', () => {
    let quoteSelector;
    let state;

    beforeEach(() => {
        state = {
            quote: getQuoteState(),
        };
    });

    describe('#getQuote()', () => {
        it('returns the current quote', () => {
            quoteSelector = new QuoteSelector(state.quote);

            expect(quoteSelector.getQuote()).toEqual(state.quote.data);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            quoteSelector = new QuoteSelector({
                ...state.quote,
                errors: { loadError },
            });

            expect(quoteSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            quoteSelector = new QuoteSelector(state.quote);

            expect(quoteSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading quote', () => {
            quoteSelector = new QuoteSelector({
                ...state.quote,
                statuses: { isLoading: true },
            });

            expect(quoteSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading quote', () => {
            quoteSelector = new QuoteSelector(state.quote);

            expect(quoteSelector.isLoading()).toEqual(false);
        });
    });
});
