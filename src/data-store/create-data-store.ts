import combineReducers from './combine-reducers';
import DataStore from './data-store';

/**
 * @param {Reducer|Object<string, Reducer>} reducer
 * @param {Object} [initialState]
 * @param {Object} [options]
 * @return {DataStore}
 */
export default function createDataStore(reducer, initialState, options) {
    if (typeof reducer === 'function') {
        return new DataStore(reducer, initialState, options);
    }

    return new DataStore(combineReducers(reducer), initialState, options);
}
