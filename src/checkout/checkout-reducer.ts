import { combineReducers } from '@bigcommerce/data-store';

import { OrderAction, OrderActionType } from '../order';

import Checkout from './checkout';
import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import CheckoutState, { CheckoutErrorsState, CheckoutStatusesState } from './checkout-state';

const DEFAULT_STATE: CheckoutState = {
    errors: {},
    statuses: {},
};

export default function checkoutReducer(
    state: CheckoutState = DEFAULT_STATE,
    action: CheckoutAction | OrderAction
): CheckoutState {
    const reducer = combineReducers<CheckoutState, CheckoutAction | OrderAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Checkout | undefined,
    action: CheckoutAction | OrderAction
): Checkout | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? action.payload : data;

    case OrderActionType.SubmitOrderSucceeded:
        return action.payload && data ? { ...data, orderId: action.payload.order.orderId } : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: CheckoutErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction | OrderAction
): CheckoutErrorsState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return {
            ...errors,
            loadError: undefined,
        };

    case CheckoutActionType.LoadCheckoutFailed:
        return {
            ...errors,
            loadError: action.payload,
        };

    default:
        return errors;
    }
}

function statusesReducer(
    statuses: CheckoutStatusesState = DEFAULT_STATE.statuses,
    action: CheckoutAction | OrderAction
): CheckoutStatusesState {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutRequested:
        return {
            ...statuses,
            isLoading: true,
        };

    case CheckoutActionType.LoadCheckoutFailed:
    case CheckoutActionType.LoadCheckoutSucceeded:
        return {
            ...statuses,
            isLoading: false,
        };

    default:
        return statuses;
    }
}
