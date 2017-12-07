import { getQuote, getQuoteMeta } from './quotes.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import QuoteSelector from './quote-selector';

describe('QuoteSelector', () => {
    let quote;
    let quoteMeta;
    let quoteSelector;
    let state;

    beforeEach(() => {
        quote = getQuote();
        quoteMeta = getQuoteMeta();
        state = {
            quote: {
                data: quote,
                meta: quoteMeta,
            },
        };
    });

    describe('#getQuote()', () => {
        it('returns the current quote', () => {
            quoteSelector = new QuoteSelector(state.quote);

            expect(quoteSelector.getQuote()).toEqual(quote);
        });
    });

    describe('#getQuoteMeta()', () => {
        it('returns quote metadata', () => {
            quoteSelector = new QuoteSelector(state.quote);

            expect(quoteSelector.getQuoteMeta()).toEqual(quoteMeta);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponseBody();

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
