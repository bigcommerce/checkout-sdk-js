"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var actionTypes = require("./shipping-country-action-types");
var data_store_1 = require("../../data-store");
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
            return action.payload || [];
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
        case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}
function shippingCountryReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        data: dataReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingCountryReducer;
//# sourceMappingURL=shipping-country-reducer.js.map