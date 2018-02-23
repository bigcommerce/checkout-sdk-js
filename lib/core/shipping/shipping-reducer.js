"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("../../data-store");
var actionTypes = require("./shipping-action-types");
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function shippingReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case actionTypes.INITIALIZE_SHIPPING_REQUESTED:
        case actionTypes.INITIALIZE_SHIPPING_SUCCEEDED:
            return tslib_1.__assign({}, errors, { initializeMethod: undefined, initializeError: undefined });
        case actionTypes.INITIALIZE_SHIPPING_FAILED:
            return tslib_1.__assign({}, errors, { initializeMethod: action.meta && action.meta.methodId, initializeError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case actionTypes.INITIALIZE_SHIPPING_REQUESTED:
            return tslib_1.__assign({}, statuses, { initializingMethod: action.meta && action.meta.methodId, isInitializing: true });
        case actionTypes.INITIALIZE_SHIPPING_FAILED:
        case actionTypes.INITIALIZE_SHIPPING_SUCCEEDED:
            return tslib_1.__assign({}, statuses, { initializingMethod: undefined, isInitializing: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=shipping-reducer.js.map