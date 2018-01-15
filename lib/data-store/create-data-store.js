"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var combine_reducers_1 = require("./combine-reducers");
var data_store_1 = require("./data-store");
function createDataStore(reducer, initialState, options) {
    if (typeof reducer === 'function') {
        return new data_store_1.default(reducer, initialState, options);
    }
    return new data_store_1.default(combine_reducers_1.default(reducer), initialState, options);
}
exports.default = createDataStore;
//# sourceMappingURL=create-data-store.js.map