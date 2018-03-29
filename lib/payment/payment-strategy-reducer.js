"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var payment_strategy_actions_1 = require("./payment-strategy-actions");
var payment_strategy_state_1 = require("./payment-strategy-state");
function paymentStrategyReducer(state, action) {
    if (state === void 0) { state = payment_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = paymentStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = payment_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded:
            return tslib_1.__assign({}, errors, { executeError: undefined, executeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed:
            return tslib_1.__assign({}, errors, { executeError: action.payload, executeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded:
            return tslib_1.__assign({}, errors, { finalizeError: undefined, finalizeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed:
            return tslib_1.__assign({}, errors, { finalizeError: action.payload, finalizeMethodId: action.meta && action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = payment_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested:
            return tslib_1.__assign({}, statuses, { isExecuting: true, executeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded:
            return tslib_1.__assign({}, statuses, { isExecuting: false, executeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested:
            return tslib_1.__assign({}, statuses, { isFinalizing: true, finalizeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded:
            return tslib_1.__assign({}, statuses, { isFinalizing: false, finalizeMethodId: undefined });
        default:
            return statuses;
    }
}
//# sourceMappingURL=payment-strategy-reducer.js.map