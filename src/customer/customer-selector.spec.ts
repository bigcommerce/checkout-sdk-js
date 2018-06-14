import { getBillingAddressState } from '../billing/billing-addresses.mock';
import { getCartState } from '../cart/carts.mock';

import CustomerSelector from './customer-selector';
import { getCustomer, getCustomerState } from './customers.mock';

describe('CustomerSelector', () => {
    let selector: CustomerSelector;
    let state;

    beforeEach(() => {
        state = {
            customer: getCustomerState(),
            billingAddress: getBillingAddressState(),
            cart: getCartState(),
        };
    });

    describe('#getCustomer()', () => {
        it('returns current customer', () => {
            selector = new CustomerSelector(state.customer);

            expect(selector.getCustomer()).toEqual(getCustomer());
        });

        it('returns undefined if customer is unavailable', () => {
            selector = new CustomerSelector({});

            expect(selector.getCustomer()).toEqual(undefined);
        });
    });
});
