"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./payment-action-types");
function paymentReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = paymentReducer;
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
    switch (action.type) {
        case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
            return action.payload;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case actionTypes.SUBMIT_PAYMENT_REQUESTED:
        case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
            return tslib_1.__assign({}, errors, { submitError: undefined });
        case actionTypes.SUBMIT_PAYMENT_FAILED:
            return tslib_1.__assign({}, errors, { submitError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case actionTypes.SUBMIT_PAYMENT_REQUESTED:
            return tslib_1.__assign({}, statuses, { isSubmitting: true });
        case actionTypes.SUBMIT_PAYMENT_SUCCEEDED:
        case actionTypes.SUBMIT_PAYMENT_FAILED:
            return tslib_1.__assign({}, statuses, { isSubmitting: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=payment-reducer.js.map