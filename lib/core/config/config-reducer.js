"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("../../data-store");
var configActionType = require("./config-action-types");
function configReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = configReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case configActionType.LOAD_CONFIG_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload) : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case configActionType.LOAD_CONFIG_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case configActionType.LOAD_CONFIG_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case configActionType.LOAD_CONFIG_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case configActionType.LOAD_CONFIG_SUCCEEDED:
        case configActionType.LOAD_CONFIG_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=config-reducer.js.map