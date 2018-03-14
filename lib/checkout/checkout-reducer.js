"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var checkout_actions_1 = require("./checkout-actions");
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function shippingReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
            return action.payload ? action.payload : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_actions_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case checkout_actions_1.CheckoutActionType.LoadCheckoutFailed:
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}
//# sourceMappingURL=checkout-reducer.js.map