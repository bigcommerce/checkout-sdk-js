"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
function composeReducers() {
    var reducers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        reducers[_i] = arguments[_i];
    }
    return function (state, action) {
        return lodash_1.flowRight.apply(null, reducers.map(function (reducer) { return lodash_1.curryRight(reducer)(action); }))(state);
    };
}
exports.default = composeReducers;
//# sourceMappingURL=compose-reducers.js.map