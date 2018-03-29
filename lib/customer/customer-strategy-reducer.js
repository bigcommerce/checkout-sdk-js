"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var customer_strategy_actions_1 = require("./customer-strategy-actions");
var customer_strategy_state_1 = require("./customer-strategy-state");
function customerStrategyReducer(state, action) {
    if (state === void 0) { state = customer_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = customerStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = customer_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded:
            return tslib_1.__assign({}, errors, { signInError: undefined, signInMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed:
            return tslib_1.__assign({}, errors, { signInError: action.payload, signInMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded:
            return tslib_1.__assign({}, errors, { signOutError: undefined, signOutMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed:
            return tslib_1.__assign({}, errors, { signOutError: action.payload, signOutMethodId: action.meta && action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = customer_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested:
            return tslib_1.__assign({}, statuses, { isSigningIn: true, signInMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded:
            return tslib_1.__assign({}, statuses, { isSigningIn: false, signInMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested:
            return tslib_1.__assign({}, statuses, { isSigningOut: true, signOutMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded:
            return tslib_1.__assign({}, statuses, { isSigningOut: false, signOutMethodId: undefined });
        default:
            return statuses;
    }
}
//# sourceMappingURL=customer-strategy-reducer.js.map