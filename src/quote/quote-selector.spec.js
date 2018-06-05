import { getQuoteState } from './internal-quotes.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import QuoteSelector from './quote-selector';
import { ShippingAddressSelector } from '../shipping';
import { getConfig } from '../config/configs.mock';

describe('QuoteSelector', () => {
    let quoteSelector;
    let shippingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            quote: getQuoteState(),
            config: getConfig(),
        };

        shippingAddressSelector = new ShippingAddressSelector(state.quote, state.config);
        quoteSelector = new QuoteSelector(state.quote, shippingAddressSelector);
    });

    describe('#getQuote()', () => {
        it('returns the current quote', () => {
            expect(quoteSelector.getQuote())
                .toEqual(state.quote.data);
        });

        it('returns the same instance as the shipping selector', () => {
            expect(quoteSelector.getQuote().shippingAddress)
                .toBe(shippingAddressSelector.getShippingAddress());
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponse();

            quoteSelector = new QuoteSelector({
                ...state.quote,
                errors: { loadError },
            }, shippingAddressSelector);

            expect(quoteSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            expect(quoteSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading quote', () => {
            quoteSelector = new QuoteSelector({
                ...state.quote,
                statuses: { isLoading: true },
            }, shippingAddressSelector);

            expect(quoteSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading quote', () => {
            expect(quoteSelector.isLoading()).toEqual(false);
        });
    });
});
