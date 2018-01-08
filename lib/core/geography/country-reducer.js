"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var actionTypes = require("./country-action-types");
var data_store_1 = require("../../data-store");
function dataReducer(data, action) {
    if (data === void 0) { data = []; }
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
            return action.payload || [];
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_REQUESTED:
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_COUNTRIES_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
        case actionTypes.LOAD_COUNTRIES_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}
function countryReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = countryReducer;
//# sourceMappingURL=country-reducer.js.map