import { getErrorResponseBody } from '../common/error/errors.mock';
import { getQuoteState } from '../quote/quotes.mock';
import ShippingAddressSelector from './shipping-address-selector';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            quote: getQuoteState(),
        };
    });

    describe('#getShippingAddress()', () => {
        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(state.quote);

            expect(shippingAddressSelector.getShippingAddress()).toEqual(state.quote.data.shippingAddress);
        });
    });

    describe('#getUpdateError()', () => {
        it('returns error if unable to update', () => {
            const updateShippingAddressError = getErrorResponseBody();

            shippingAddressSelector = new ShippingAddressSelector({
                ...state.quote,
                errors: { updateShippingAddressError },
            });

            expect(shippingAddressSelector.getUpdateError()).toEqual(updateShippingAddressError);
        });

        it('does not returns error if able to update', () => {
            shippingAddressSelector = new ShippingAddressSelector(state.quote);

            expect(shippingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if updating shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector({
                ...state.quote,
                statuses: { isUpdatingShippingAddress: true },
            });

            expect(shippingAddressSelector.isUpdating()).toEqual(true);
        });

        it('returns false if not updating shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(state.quote);

            expect(shippingAddressSelector.isUpdating()).toEqual(false);
        });
    });
});
