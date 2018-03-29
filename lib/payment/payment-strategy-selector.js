"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payment_strategy_state_1 = require("./payment-strategy-state");
var PaymentStrategySelector = (function () {
    function PaymentStrategySelector(_paymentStrategy) {
        if (_paymentStrategy === void 0) { _paymentStrategy = payment_strategy_state_1.DEFAULT_STATE; }
        this._paymentStrategy = _paymentStrategy;
    }
    PaymentStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._paymentStrategy.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategy.errors.initializeError;
    };
    PaymentStrategySelector.prototype.getExecuteError = function (methodId) {
        if (methodId && this._paymentStrategy.errors.executeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategy.errors.executeError;
    };
    PaymentStrategySelector.prototype.getFinalizeError = function (methodId) {
        if (methodId && this._paymentStrategy.errors.finalizeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategy.errors.finalizeError;
    };
    PaymentStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._paymentStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategy.statuses.isInitializing;
    };
    PaymentStrategySelector.prototype.isExecuting = function (methodId) {
        if (methodId && this._paymentStrategy.statuses.executeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategy.statuses.isExecuting;
    };
    PaymentStrategySelector.prototype.isFinalizing = function (methodId) {
        if (methodId && this._paymentStrategy.statuses.finalizeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategy.statuses.isFinalizing;
    };
    return PaymentStrategySelector;
}());
exports.default = PaymentStrategySelector;
//# sourceMappingURL=payment-strategy-selector.js.map