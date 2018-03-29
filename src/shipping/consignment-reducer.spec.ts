import { createAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

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
