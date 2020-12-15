import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CustomerSelector, { createCustomerSelectorFactory, CustomerSelectorFactory } from './customer-selector';
import { getCustomer } from './customers.mock';

describe('CustomerSelector', () => {
    let createCustomerSelector: CustomerSelectorFactory;
    let selector: CustomerSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createCustomerSelector = createCustomerSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getCustomer()', () => {
        it('returns current customer', () => {
            selector = createCustomerSelector(state.customer);

            expect(selector.getCustomer()).toEqual(getCustomer());
        });

        it('returns undefined if customer is unavailable', () => {
            selector = createCustomerSelector({});

            expect(selector.getCustomer()).toEqual(undefined);
        });
    });
});
