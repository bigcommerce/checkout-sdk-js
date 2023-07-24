import ProviderCustomerDataState, { DEFAULT_STATE } from './provider-state';
import { ProviderCustomerDataType, UpdateProviderCustomerDataAction } from './provider-actions';
import { combineReducers } from '@bigcommerce/data-store';
import { objectMerge } from '../common/utility';

type ReducerActionType = UpdateProviderCustomerDataAction;

export default function providerCustomerDataReducer(
    state: ProviderCustomerDataState = DEFAULT_STATE,
    action: ReducerActionType,
): ProviderCustomerDataState {
    const reducer = combineReducers<ProviderCustomerDataState, ReducerActionType>({
        data: dataReducer,
    });

    return reducer(state, action);
}

function dataReducer(data: object | undefined, action: ReducerActionType): object | undefined {
    switch (action.type) {
        case ProviderCustomerDataType.ProviderCustomerDataCollected:
            return objectMerge(data, action.payload);

        default:
            return data;
    }
}
