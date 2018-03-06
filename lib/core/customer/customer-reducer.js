"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var customerActionTypes = require("../customer/customer-action-types");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
function customerReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = customerReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case orderActionTypes.LOAD_ORDER_SUCCEEDED:
        case orderActionTypes.FINALIZE_ORDER_SUCCEEDED:
        case orderActionTypes.SUBMIT_ORDER_SUCCEEDED:
        case quoteActionTypes.LOAD_QUOTE_SUCCEEDED:
            return action.payload ? tslib_1.__assign({}, data, action.payload.customer) : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { signInError: undefined });
        case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
            return tslib_1.__assign({}, errors, { signInError: action.payload });
        case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { signOutError: undefined });
        case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
            return tslib_1.__assign({}, errors, { signOutError: action.payload });
        case customerActionTypes.INITIALIZE_CUSTOMER_REQUESTED:
        case customerActionTypes.INITIALIZE_CUSTOMER_SUCCEEDED:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethod: undefined });
        case customerActionTypes.INITIALIZE_CUSTOMER_FAILED:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethod: action.meta && action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case customerActionTypes.SIGN_IN_CUSTOMER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSigningIn: true });
        case customerActionTypes.SIGN_IN_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_IN_CUSTOMER_FAILED:
            return tslib_1.__assign({}, statuses, { isSigningIn: false });
        case customerActionTypes.SIGN_OUT_CUSTOMER_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSigningOut: true });
        case customerActionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED:
        case customerActionTypes.SIGN_OUT_CUSTOMER_FAILED:
            return tslib_1.__assign({}, statuses, { isSigningOut: false });
        case customerActionTypes.INITIALIZE_CUSTOMER_REQUESTED:
            return tslib_1.__assign({}, statuses, { initializingMethod: action.meta && action.meta.methodId, isInitializing: true });
        case customerActionTypes.INITIALIZE_CUSTOMER_SUCCEEDED:
        case customerActionTypes.INITIALIZE_CUSTOMER_FAILED:
            return tslib_1.__assign({}, statuses, { initializingMethod: undefined, isInitializing: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=customer-reducer.js.map