import { createAction } from '@bigcommerce/data-store';
import { getCheckout } from '../checkout/checkouts.mock';
import { CheckoutActionType } from '../checkout';
import billingAddressReducer from './billing-address-reducer';

describe('billingAddressReducer', () => {
    it('returns billing address', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());
        const output = billingAddressReducer({}, action);

        expect(output).toEqual({
            data: action.payload.billingAddress,
        });
    });
});
