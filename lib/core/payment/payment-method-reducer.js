"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var actionTypes = require("./payment-method-action-types");
var data_store_1 = require("../../data-store");
var utility_1 = require("../common/utility");
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
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
            return utility_1.mergeOrPush(data || [], action.payload.paymentMethod, {
                id: action.payload.paymentMethod.id,
                gateway: action.payload.paymentMethod.gateway,
            });
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return action.payload.paymentMethods || [];
        default:
            return data;
    }
}
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
            return tslib_1.__assign({}, errors, { loadMethod: undefined, loadMethodError: undefined });
        case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, errors, { loadMethod: action.meta.methodId, loadMethodError: action.payload });
        case actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED:
        case actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED:
            return tslib_1.__assign({}, errors, { initializeMethod: undefined, initializeError: undefined });
        case actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, errors, { initializeMethod: action.meta.methodId, initializeError: action.payload });
        default:
            return errors;
    }
}
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
        case actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED:
            return tslib_1.__assign({}, statuses, { initializingMethod: action.meta && action.meta.methodId, isInitializing: true });
        case actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED:
        case actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, statuses, { initializingMethod: undefined, isInitializing: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=payment-method-reducer.js.map