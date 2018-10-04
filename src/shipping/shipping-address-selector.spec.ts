import { CartSelector } from '../cart';
import { getCartState } from '../cart/carts.mock';
import { CountrySelector } from '../geography';
import { getCountriesState } from '../geography/countries.mock';

import ConsignmentSelector from './consignment-selector';
import ConsignmentState from './consignment-state';
import { getConsignment, getConsignmentsState } from './consignments.mock';
import ShippingAddressSelector from './shipping-address-selector';

describe('ShippingAddressSelector', () => {
    let shippingAddressSelector: ShippingAddressSelector;
    let consignmentState: ConsignmentState;
    let countrySelector: CountrySelector;
    let cartSelector: CartSelector;

    describe('#getShippingAddress()', () => {
        beforeEach(() => {
            consignmentState = getConsignmentsState();
            countrySelector = new CountrySelector(getCountriesState());
            cartSelector = new CartSelector(getCartState());
        });

        it('returns the current shipping address', () => {
            shippingAddressSelector = new ShippingAddressSelector(
                new ConsignmentSelector(consignmentState, cartSelector, countrySelector)
            );

            expect(shippingAddressSelector.getShippingAddress())
                .toEqual(getConsignment().shippingAddress);
        });

        describe('when there is no shipping information', () => {
            beforeEach(() => {
                consignmentState = {
                    ...consignmentState,
                    data: undefined,
                };
            });

            it('returns undefined', () => {
                shippingAddressSelector = new ShippingAddressSelector(
                    new ConsignmentSelector(consignmentState, cartSelector, countrySelector)
                );

                expect(shippingAddressSelector.getShippingAddress()).toBeUndefined();
            });
        });
    });
});
