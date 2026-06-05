import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import { B2BPostOrderActionType, PersistB2BMetadataAction } from './b2b-post-order-actions';
import B2BPostOrderState, {
    B2BPostOrderData,
    B2BPostOrderErrorsState,
    B2BPostOrderStatusesState,
    DEFAULT_STATE,
} from './b2b-post-order-state';

export default function b2bPostOrderReducer(
    state: B2BPostOrderState = DEFAULT_STATE,
    action: Action,
): B2BPostOrderState {
    const reducer = combineReducers<B2BPostOrderState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: B2BPostOrderData | undefined,
    action: PersistB2BMetadataAction,
): B2BPostOrderData | undefined {
    switch (action.type) {
        case B2BPostOrderActionType.PersistB2BMetadataSucceeded:
            return action.payload;

        default:
            return data;
    }
}

function errorsReducer(
    errors: B2BPostOrderErrorsState = DEFAULT_STATE.errors,
    action: PersistB2BMetadataAction,
): B2BPostOrderErrorsState {
    switch (action.type) {
        case B2BPostOrderActionType.PersistB2BMetadataRequested:
        case B2BPostOrderActionType.PersistB2BMetadataSucceeded:
            return objectSet(errors, 'persistB2bMetadataError', undefined);

        case B2BPostOrderActionType.PersistB2BMetadataFailed:
            return objectSet(errors, 'persistB2bMetadataError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: B2BPostOrderStatusesState = DEFAULT_STATE.statuses,
    action: PersistB2BMetadataAction,
): B2BPostOrderStatusesState {
    switch (action.type) {
        case B2BPostOrderActionType.PersistB2BMetadataRequested:
            return objectSet(statuses, 'isPersisting', true);

        case B2BPostOrderActionType.PersistB2BMetadataFailed:
        case B2BPostOrderActionType.PersistB2BMetadataSucceeded:
            return objectSet(statuses, 'isPersisting', false);

        default:
            return statuses;
    }
}
