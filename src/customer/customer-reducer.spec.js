import { getCustomer } from './customers.mock';
import customerReducer from './customer-reducer';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { BillingAddressActionType } from '../billing/billing-address-actions';

describe('customerReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new state with customer data when checkout is loaded successfully', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCustomer(),
        }));
    });

    it('returns new state with customer data when billing address is updated successfully', () => {
        const action = {
            type: BillingAddressActionType.UpdateBillingAddressSucceeded,
            payload: getCheckout(),
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: { email: getCustomer().email },
        }));
    });
});
