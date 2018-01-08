"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var paymentMethodTypes = require("./payment-method-types");
var PaymentStrategyRegistry = (function () {
    function PaymentStrategyRegistry(config) {
        if (config === void 0) { config = {}; }
        this._strategies = {};
        this._clientSidePaymentProviders = config.clientSidePaymentProviders;
    }
    PaymentStrategyRegistry.prototype.addStrategy = function (name, strategy) {
        if (this._strategies[name]) {
            throw new Error("\"" + name + "\" payment strategy is already registered");
        }
        this._strategies[name] = strategy;
    };
    PaymentStrategyRegistry.prototype.getStrategy = function (name) {
        if (!this._strategies[name]) {
            throw new Error("\"" + name + "\" payment strategy could not be found");
        }
        return this._strategies[name];
    };
    PaymentStrategyRegistry.prototype.getStrategyByMethod = function (paymentMethod) {
        try {
            return this.getStrategy(paymentMethod.id);
        }
        catch (error) {
            if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
                return this.getStrategy('offline');
            }
            if (!this._isClientSidePaymentSupported(paymentMethod)) {
                return this.getStrategy('legacy');
            }
            if (paymentMethod.type === paymentMethodTypes.HOSTED) {
                return this.getStrategy('offsite');
            }
            return this.getStrategy('creditcard');
        }
    };
    PaymentStrategyRegistry.prototype._isClientSidePaymentSupported = function (paymentMethod) {
        if (!this._clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return true;
        }
        return lodash_1.some(this._clientSidePaymentProviders, function (id) {
            return paymentMethod.id === id || paymentMethod.gateway === id;
        });
    };
    return PaymentStrategyRegistry;
}());
exports.default = PaymentStrategyRegistry;
//# sourceMappingURL=payment-strategy-registry.js.map