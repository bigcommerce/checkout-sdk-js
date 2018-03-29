"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var checkout_1 = require("../checkout");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var map_to_internal_incomplete_order_1 = require("./map-to-internal-incomplete-order");
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
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, data, map_to_internal_incomplete_order_1.default(action.payload, data));
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.order) : data;
        default:
            return data;
    }
}
function metaReducer(meta, action) {
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
        default:
            return statuses;
    }
}
//# sourceMappingURL=order-reducer.js.map