"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var combine_reducers_1 = require("./combine-reducers");
var data_store_1 = require("./data-store");
/**
 * @param {Reducer|Object<string, Reducer>} reducer
 * @param {Object} [initialState]
 * @param {Function} [stateTransformer]
 * @return {DataStore}
 */
function createDataStore(reducer, initialState, stateTransformer) {
    if (typeof reducer === 'function') {
        return new data_store_1.default(reducer, initialState, stateTransformer);
    }
    return new data_store_1.default(combine_reducers_1.default(reducer), initialState, stateTransformer);
}
exports.default = createDataStore;
//# sourceMappingURL=create-data-store.js.map