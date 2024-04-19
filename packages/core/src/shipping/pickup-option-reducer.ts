import { Action, combineReducers, composeReducers } from '@bigcommerce/data-store';

import { clearErrorReducer } from '../common/error';
import { objectFlatten, objectSet, objectWithSortedKeys } from '../common/utility';

import { PickupOptionQueryMap } from './pickup-option';
import { LoadPickupOptionsAction, PickupOptionActionType } from './pickup-option-actions';
import PickupOptionState, {
    DEFAULT_STATE,
    PickupOptionErrorsState,
    PickupOptionStatusesState,
} from './pickup-option-state';

export default function pickupOptionReducer(
    state: PickupOptionState = DEFAULT_STATE,
    action: Action,
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
    action: LoadPickupOptionsAction,
): PickupOptionQueryMap | undefined {
    switch (action.type) {
        case PickupOptionActionType.LoadPickupOptionsSucceeded:
            if (action.meta) {
                const optionQuery = {
                    consignmentId: action.meta.consignmentId,
                    searchArea: action.meta.searchArea,
                };
                const flattenedMeta = objectFlatten(optionQuery);
                const sortedflattenedMeta = objectWithSortedKeys(flattenedMeta);
                const keyString = btoa(`${JSON.stringify(sortedflattenedMeta)}`);

                return objectSet(data, keyString, action.payload);
            }

            break;

        default:
            return data;
    }
}

function errorsReducer(errors: PickupOptionErrorsState = DEFAULT_STATE.errors, action: Action) {
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
    action: Action,
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
