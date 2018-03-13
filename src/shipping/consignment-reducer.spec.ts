import { createAction } from '@bigcommerce/data-store';
import { getCheckout } from '../checkout/checkouts.mock';
import { CheckoutActionType } from '../checkout';
import consignmentReducer from './consignment-reducer';

describe('consignmentReducer', () => {
    it('returns list of consignments', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());
        const output = consignmentReducer({}, action);

        expect(output).toEqual({
            data: action.payload.consignments,
        });
    });
});
