"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var customerActionTypes = require("../customer/customer-action-types");
var orderActionTypes = require("../order/order-action-types");
var quoteActionTypes = require("../quote/quote-action-types");
var data_store_1 = require("../../data-store");
/**
 * @param {CustomerState} state
 * @param {Action} action
 * @return {CustomerState}
 */
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
/**
 * @private
 * @param {Customer} data
 * @param {Action} action
 * @return {Customer}
 */
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
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
/**
 * @private
 * @param {Object} errors
 * @param {Action} action
 * @return {Object}
 */
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
        default:
            return errors;
    }
}
/**
 * @private
 * @param {Object} statuses
 * @param {Action} action
 * @return {Object}
 */
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
        default:
            return statuses;
    }
}
//# sourceMappingURL=customer-reducer.js.map