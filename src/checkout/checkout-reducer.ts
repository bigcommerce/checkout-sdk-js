import { Action, combineReducers } from '@bigcommerce/data-store';
import { Address } from '../address';
import { CheckoutAction, CheckoutActionType } from './checkout-actions';
import Checkout from './checkout';
import CheckoutState, { CheckoutErrorsState, CheckoutStatusesState } from './checkout-state';

const DEFAULT_STATE: CheckoutState = {
    errors: {},
    statuses: {},
};

export default function shippingReducer(
    state: CheckoutState = DEFAULT_STATE,
    action: CheckoutAction
): CheckoutState {
    const reducer = combineReducers<CheckoutState, CheckoutAction>({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: Checkout | undefined,
    action: CheckoutAction
): Checkout | undefined {
    switch (action.type) {
    case CheckoutActionType.LoadCheckoutSucceeded:
        return action.payload ? action.payload : data;

    default:
        return data;
    }
}

function errorsReducer(
    errors: CheckoutErrorsState = DEFAULT_STATE.errors,
    action: CheckoutAction
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
    action: CheckoutAction
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
