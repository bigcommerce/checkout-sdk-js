import { getQuoteState } from '../quote/internal-quotes.mock';
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

        it('returns undefined if quote is not available', () => {
            shippingAddressSelector = new ShippingAddressSelector({ ...state.quote, data: undefined });

            expect(shippingAddressSelector.getShippingAddress()).toEqual();
        });
    });
});
