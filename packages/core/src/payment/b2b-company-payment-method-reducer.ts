import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import B2BCompanyPaymentMethod from './b2b-company-payment-method';
import {
    B2BCompanyPaymentMethodActionType,
    LoadB2BCompanyPaymentMethodsAction,
} from './b2b-company-payment-method-actions';
import B2BCompanyPaymentMethodState, {
    B2BCompanyPaymentMethodErrorsState,
    B2BCompanyPaymentMethodStatusesState,
    DEFAULT_STATE,
} from './b2b-company-payment-method-state';

export default function b2bCompanyPaymentMethodReducer(
    state: B2BCompanyPaymentMethodState = DEFAULT_STATE,
    action: Action,
): B2BCompanyPaymentMethodState {
    const reducer = combineReducers<B2BCompanyPaymentMethodState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: B2BCompanyPaymentMethod[] | undefined,
    action: LoadB2BCompanyPaymentMethodsAction,
): B2BCompanyPaymentMethod[] | undefined {
    switch (action.type) {
        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded:
            return action.payload;

        default:
            return data;
    }
}

function errorsReducer(
    errors: B2BCompanyPaymentMethodErrorsState = DEFAULT_STATE.errors,
    action: LoadB2BCompanyPaymentMethodsAction,
): B2BCompanyPaymentMethodErrorsState {
    switch (action.type) {
        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested:
        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed:
            return objectSet(errors, 'loadError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: B2BCompanyPaymentMethodStatusesState = DEFAULT_STATE.statuses,
    action: LoadB2BCompanyPaymentMethodsAction,
): B2BCompanyPaymentMethodStatusesState {
    switch (action.type) {
        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested:
            return objectSet(statuses, 'isLoading', true);

        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed:
        case B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
