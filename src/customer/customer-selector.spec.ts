import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { CountrySelector } from '../geography';
import { getCountriesState } from '../geography/countries.mock';

import CustomerSelector from './customer-selector';
import { getCustomer } from './customers.mock';

describe('CustomerSelector', () => {
    let selector: CustomerSelector;
    let state: CheckoutStoreState;
    let countrySelector: CountrySelector;

    beforeEach(() => {
        state = getCheckoutStoreState();
        countrySelector = new CountrySelector(getCountriesState());
    });

    describe('#getCustomer()', () => {
        it('returns current customer', () => {
            selector = new CustomerSelector(state.customer, countrySelector);

            expect(selector.getCustomer()).toEqual(getCustomer());
        });

        it('returns undefined if customer is unavailable', () => {
            selector = new CustomerSelector({}, countrySelector);

            expect(selector.getCustomer()).toEqual(undefined);
        });
    });
});
