"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var shipping_strategy_actions_1 = require("./shipping-strategy-actions");
var shipping_strategy_state_1 = require("./shipping-strategy-state");
function shippingStrategyReducer(state, action) {
    if (state === void 0) { state = shipping_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = shipping_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded:
            return tslib_1.__assign({}, errors, { updateAddressError: undefined, updateAddressMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed:
            return tslib_1.__assign({}, errors, { updateAddressError: action.payload, updateAddressMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded:
            return tslib_1.__assign({}, errors, { selectOptionError: undefined, selectOptionMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed:
            return tslib_1.__assign({}, errors, { selectOptionError: action.payload, selectOptionMethodId: action.meta && action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = shipping_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested:
            return tslib_1.__assign({}, statuses, { isUpdatingAddress: true, updateAddressMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded:
            return tslib_1.__assign({}, statuses, { isUpdatingAddress: false, updateAddressMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested:
            return tslib_1.__assign({}, statuses, { isSelectingOption: true, selectOptionMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded:
            return tslib_1.__assign({}, statuses, { isSelectingOption: false, selectOptionMethodId: undefined });
        default:
            return statuses;
    }
}
//# sourceMappingURL=shipping-strategy-reducer.js.map