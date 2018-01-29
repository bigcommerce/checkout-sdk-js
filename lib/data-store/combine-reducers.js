"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
function combineReducers(reducers) {
    return function (state, action) {
        return Object.keys(reducers).reduce(function (result, key) {
            var reducer = reducers[key];
            var currentState = state ? state[key] : undefined;
            var newState = reducer(currentState, action);
            if (currentState === newState && result) {
                return result;
            }
            return lodash_1.assign({}, result, (_a = {}, _a[key] = newState, _a));
            var _a;
        }, state);
    };
}
exports.default = combineReducers;
//# sourceMappingURL=combine-reducers.js.map