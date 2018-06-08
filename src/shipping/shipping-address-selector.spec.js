import { getQuoteState } from '../quote/internal-quotes.mock';
import ShippingAddressSelector from './shipping-address-selector';
import { getConfigState } from '../config/configs.mock';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector;
    let state;

    beforeEach(() => {
        state = {
            config: getConfigState(),
            quote: getQuoteState(),
        };
    });

    describe('#getShippingAddress()', () => {
        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(state.quote, state.config);

            expect(shippingAddressSelector.getShippingAddress()).toEqual(state.quote.data.shippingAddress);
        });

        it('returns undefined if quote is not available', () => {
            shippingAddressSelector = new ShippingAddressSelector({ ...state.quote, data: undefined }, state.config);

            expect(shippingAddressSelector.getShippingAddress()).toEqual();
        });

        describe('when there is no shipping information', () => {
            beforeEach(() => {
                state = {
                    quote: { data: {} },
                    config: getConfigState(),
                };
            });

            it('returns the current shipping address', () => {
                shippingAddressSelector = new ShippingAddressSelector(state.quote, state.config);

                expect(shippingAddressSelector.getShippingAddress().countryCode).toEqual('AU');
            });
        });

        describe('when there is no shipping neither config information', () => {
            beforeEach(() => {
                state = {
                    quote: { data: {} },
                    config: { data: {} },
                };
            });

            it('returns undefined', () => {
                shippingAddressSelector = new ShippingAddressSelector(state.quote, state.config);

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
