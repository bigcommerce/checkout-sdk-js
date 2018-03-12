import { getErrorResponse } from '../common/http-request/responses.mock';
import { getQuoteState } from '../quote/internal-quotes.mock';
import BillingAddressSelector from './billing-address-selector';

describe('BillingAddressSelector', () => {
    let billingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            quote: getQuoteState(),
        };
    });

    describe('#getBillingAddress()', () => {
        it('returns the current billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.quote);

            expect(billingAddressSelector.getBillingAddress()).toEqual(state.quote.data.billingAddress);
        });

        it('returns undefined if quote is not available', () => {
            billingAddressSelector = new BillingAddressSelector({ ...state.quote, data: undefined });

            expect(billingAddressSelector.getBillingAddress()).toEqual();
        });
    });

    describe('#getUpdateError()', () => {
        it('returns error if unable to update', () => {
            const updateBillingAddressError = getErrorResponse();

            billingAddressSelector = new BillingAddressSelector({
                ...state.quote,
                errors: { updateBillingAddressError },
            });

            expect(billingAddressSelector.getUpdateError()).toEqual(updateBillingAddressError);
        });

        it('does not returns error if able to update', () => {
            billingAddressSelector = new BillingAddressSelector(state.quote);

            expect(billingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector({
                ...state.quote,
                statuses: { isUpdatingBillingAddress: true },
            });

            expect(billingAddressSelector.isUpdating()).toEqual(true);
        });

        it('returns false if not updating billing address', () => {
            billingAddressSelector = new BillingAddressSelector(state.quote);

            expect(billingAddressSelector.isUpdating()).toEqual(false);
        });
    });
});
