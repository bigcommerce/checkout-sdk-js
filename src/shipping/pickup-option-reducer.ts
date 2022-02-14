import { combineReducers, composeReducers, Action } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectSet } from '../common/utility';

import { PickupOptionQueryMap, PickupOptionResult } from './pickup-option';
import { LoadPickupOptionsAction, PickupOptionActionType } from './pickup-option-actions';
import PickupOptionState, { DEFAULT_STATE, PickupOptionErrorsState, PickupOptionStatusesState } from './pickup-option-state';

export default function pickupOptionReducer(
    state: PickupOptionState = DEFAULT_STATE,
    action: Action
): PickupOptionState {
    const reducer = combineReducers<PickupOptionState>({
        data: dataReducer,
        errors: composeReducers(errorsReducer, clearErrorReducer),
        statuses: statusesReducer,
    });

    return reducer(state, action);
}

function dataReducer(
    data: PickupOptionQueryMap | undefined,
    action: LoadPickupOptionsAction
): PickupOptionQueryMap | undefined {
    switch (action.type) {
        case PickupOptionActionType.LoadPickupOptionsSucceeded:
            if (action.meta) {
                const keyString = btoa(`${action.meta.consignmentId}-${JSON.stringify(action.meta.searchArea)}`);

                return objectSet(data, keyString , action.payload);
            }

        default:
            return data;
    }
}

function errorsReducer(
    errors: PickupOptionErrorsState = DEFAULT_STATE.errors,
    action: Action
) {
    switch (action.type) {
        case PickupOptionActionType.LoadPickupOptionsRequested:
        case PickupOptionActionType.LoadPickupOptionsSucceeded:
            return objectSet(errors, 'loadError', undefined);

        case PickupOptionActionType.LoadPickupOptionsFailed:
            return objectSet(errors, 'loadError', action.payload);

        default:
            return errors;
    }
}

function statusesReducer(
    statuses: PickupOptionStatusesState = DEFAULT_STATE.statuses,
    action: Action
) {
    switch (action.type) {
        case PickupOptionActionType.LoadPickupOptionsRequested:
            return objectSet(statuses, 'isLoading', true);
        case PickupOptionActionType.LoadPickupOptionsSucceeded:
        case PickupOptionActionType.LoadPickupOptionsFailed:
            return objectSet(statuses, 'isLoading', false);

        default:
            return statuses;
    }
}
