import combineReducers from './combine-reducers';
import DataStore from './data-store';

/**
 * @param {Reducer|Object<string, Reducer>} reducer
 * @param {Object} [initialState]
 * @param {Function} [stateTransformer]
 * @param {Object} [options]
 * @return {DataStore}
 */
export default function createDataStore(reducer, initialState, stateTransformer, options) {
    if (typeof reducer === 'function') {
        return new DataStore(reducer, initialState, stateTransformer, options);
    }

    return new DataStore(combineReducers(reducer), initialState, stateTransformer, options);
}
