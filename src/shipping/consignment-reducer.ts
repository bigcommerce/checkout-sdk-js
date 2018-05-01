import { combineReducers } from '@bigcommerce/data-store';

import { CheckoutAction, CheckoutActionType } from '../checkout';

import Consignment from './consignment';
import { ConsignmentAction, ConsignmentActionTypes } from './consignment-actions';
import ConsignmentState from './consignment-state';

const DEFAULT_STATE: ConsignmentState = {};

export default function shippingReducer(
    state: ConsignmentState = DEFAULT_STATE,
    action: ConsignmentAction | CheckoutAction
): ConsignmentState {
    const reducer = combineReducers<ConsignmentState, ConsignmentAction | CheckoutAction>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Consignment[] | undefined,
    action: ConsignmentAction | CheckoutAction
): Consignment[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
    case ConsignmentActionTypes.CreateConsignmentsSucceeded:
    case ConsignmentActionTypes.UpdateConsignmentSucceeded:
        return action.payload ? action.payload.consignments : data;

    default:
        return data;
    }
}
