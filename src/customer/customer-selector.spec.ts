import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CustomerSelector from './customer-selector';
import { getCustomer } from './customers.mock';

describe('CustomerSelector', () => {
    let selector: CustomerSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        state = getCheckoutStoreState();
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
