import { getCustomer } from './customers.mock';
import customerReducer from './customer-reducer';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

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
});
