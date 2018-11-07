import { CheckoutAction, CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

import customerReducer from './customer-reducer';
import CustomerState from './customer-state';
import { getCustomer } from './customers.mock';

describe('customerReducer()', () => {
    let initialState: CustomerState;

    beforeEach(() => {
        initialState = {};
    });

    it('returns new state with customer data when checkout is loaded successfully', () => {
        const action: CheckoutAction = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(customerReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCustomer(),
        }));
    });
});
