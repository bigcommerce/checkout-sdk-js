import { createAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';

import { ConsignmentActionTypes } from './consignment-actions';
import consignmentReducer from './consignment-reducer';

describe('consignmentReducer', () => {
    it('returns new data when checkout is loaded', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());

        expect(consignmentReducer({}, action)).toEqual({
            data: action.payload.consignments,
        });
    });

    it('returns new data when creating consignments', () => {
        const action = createAction(ConsignmentActionTypes.CreateConsignmentsSucceeded, getCheckout());

        expect(consignmentReducer({}, action)).toEqual({
            data: action.payload.consignments,
        });
    });

    it('returns new data when updating a consignment', () => {
        const action = createAction(ConsignmentActionTypes.UpdateConsignmentSucceeded, getCheckout());

        expect(consignmentReducer({}, action)).toEqual({
            data: action.payload.consignments,
        });
    });
});
