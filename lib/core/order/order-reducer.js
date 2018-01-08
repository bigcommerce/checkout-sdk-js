"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var data_store_1 = require("../../data-store");
function orderReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = orderReducer;
function metaReducer(meta, action) {
    if (meta === void 0) { meta = {}; }
    switch (action.type) {
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
            return tslib_1.__assign({}, meta, action.meta);
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case orderActionTypes.LOAD_ORDER_REQUESTED:
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case orderActionTypes.LOAD_ORDER_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case orderActionTypes.SUBMIT_ORDER_REQUESTED:
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { submitError: undefined });
        case orderActionTypes.SUBMIT_ORDER_FAILED:
            return tslib_1.__assign({}, errors, { submitError: action.payload });
        case orderActionTypes.FINALIZE_ORDER_REQUESTED:
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { finalizeError: undefined });
        case orderActionTypes.FINALIZE_ORDER_FAILED:
            return tslib_1.__assign({}, errors, { finalizeError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case orderActionTypes.LOAD_ORDER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        case orderActionTypes.LOAD_ORDER_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case orderActionTypes.SUBMIT_ORDER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSubmitting: true });
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        case orderActionTypes.SUBMIT_ORDER_FAILED:
            return tslib_1.__assign({}, statuses, { isSubmitting: false });
        case orderActionTypes.FINALIZE_ORDER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isFinalizing: true });
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
        case orderActionTypes.FINALIZE_ORDER_FAILED:
            return tslib_1.__assign({}, statuses, { isFinalizing: false });
        default:
            return statuses;
    }
}
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
    switch (action.type) {
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.order) : data;
        default:
            return data;
    }
}
//# sourceMappingURL=order-reducer.js.map