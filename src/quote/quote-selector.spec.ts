import { BillingAddressSelector } from '../billing';
import { getBillingAddressState } from '../billing/billing-addresses.mock';
import { getCheckoutState } from '../checkout/checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';
import { ShippingAddressSelector } from '../shipping';

import { getQuoteState } from './internal-quotes.mock';
import QuoteSelector from './quote-selector';

describe('QuoteSelector', () => {
    let quoteSelector;
    let shippingAddressSelector;
    let billingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            quote: getQuoteState(),
            billingAddress: getBillingAddressState(),
            config: getConfig(),
        };

        shippingAddressSelector = new ShippingAddressSelector(state.quote, state.config);
        billingAddressSelector = new BillingAddressSelector(state.billingAddress);
        quoteSelector = new QuoteSelector(state.quote, billingAddressSelector, shippingAddressSelector);
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
                ...state.checkout,
                errors: { loadError },
            }, billingAddressSelector, shippingAddressSelector);

            expect(quoteSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            expect(quoteSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading quote', () => {
            quoteSelector = new QuoteSelector({
                ...state.checkout,
                statuses: { isLoading: true },
            }, billingAddressSelector, shippingAddressSelector);

            expect(quoteSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading quote', () => {
            expect(quoteSelector.isLoading()).toEqual(false);
        });
    });
});
