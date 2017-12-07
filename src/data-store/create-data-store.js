import combineReducers from './combine-reducers';
import DataStore from './data-store';

/**
 * @param {Reducer|Object<string, Reducer>} reducer
 * @param {Object} [initialState]
 * @param {Function} [stateTransformer]
 * @return {DataStore}
 */
export default function createDataStore(reducer, initialState, stateTransformer) {
    if (typeof reducer === 'function') {
        return new DataStore(reducer, initialState, stateTransformer);
    }

    return new DataStore(combineReducers(reducer), initialState, stateTransformer);
}
