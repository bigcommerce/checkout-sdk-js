import { Action, combineReducers } from '@bigcommerce/data-store';
import { Checkout, CheckoutAction, CheckoutActionType } from '../checkout';
import Consignment from './consignment';
import ConsignmentState from './consignment-state';

const DEFAULT_STATE: ConsignmentState = {};

export default function shippingReducer(
    state: ConsignmentState = DEFAULT_STATE,
    action: CheckoutAction
): ConsignmentState {
    const reducer = combineReducers<ConsignmentState, CheckoutAction>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Consignment[] | undefined,
    action: CheckoutAction
): Consignment[] | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? action.payload.consignments : data;

    default:
        return data;
    }
}
