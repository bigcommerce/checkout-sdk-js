import Action from './action';
import combineReducers, { ReducerMap } from './combine-reducers';
import DataStore, { DataStoreOptions } from './data-store';
import Reducer from './reducer';

export default function createDataStore<TState, TAction extends Action, TTransformedState = TState>(
    reducer: Reducer<Partial<TState>, TAction> | ReducerMap<Partial<TState>, TAction>,
    initialState: Partial<TState>,
    options: DataStoreOptions<TState, TAction, TTransformedState>
): DataStore<TState, TAction, TTransformedState> {
    if (typeof reducer === 'function') {
        return new DataStore(reducer, initialState, options);
    }

    return new DataStore(combineReducers(reducer), initialState, options);
}
