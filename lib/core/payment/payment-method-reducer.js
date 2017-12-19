"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var actionTypes = require("./payment-method-action-types");
var data_store_1 = require("../../data-store");
var utility_1 = require("../common/utility");
/**
 * @param {PaymentMethodsState} state
 * @param {Action} action
 * @return {PaymentMethodsState}
 */
function paymentMethodReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = paymentMethodReducer;
/**
 * @private
 * @param {PaymentMethod[]} data
 * @param {Action} action
 * @return {PaymentMethod[]}
 */
function dataReducer(data, action) {
    if (data === void 0) { data = []; }
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
            return utility_1.mergeOrPush(data, action.payload.paymentMethod, {
                id: action.payload.paymentMethod.id,
                gateway: action.payload.paymentMethod.gateway,
            });
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return action.payload.paymentMethods || [];
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
        case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadMethodError: undefined, failedMethod: undefined });
        case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, errors, { loadMethodError: action.payload, failedMethod: action.meta.methodId });
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
        case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
        case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoadingMethod: true, loadingMethod: action.meta.methodId });
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
        case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, statuses, { isLoadingMethod: false, loadingMethod: undefined });
        default:
            return statuses;
    }
}
//# sourceMappingURL=payment-method-reducer.js.map