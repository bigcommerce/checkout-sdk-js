"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var errors_1 = require("./errors");
var paymentMethodTypes = require("./payment-method-types");
var PaymentStrategyRegistry = (function () {
    function PaymentStrategyRegistry(config) {
        if (config === void 0) { config = {}; }
        this._factories = {};
        this._strategies = {};
        this._clientSidePaymentProviders = config.clientSidePaymentProviders;
    }
    PaymentStrategyRegistry.prototype.register = function (name, factory) {
        if (this._factories[name]) {
            throw new errors_1.PaymentMethodNotRegistrableError(name);
        }
        this._factories[name] = factory;
    };
    PaymentStrategyRegistry.prototype.getStrategy = function (paymentMethod) {
        var key = this._getKey(paymentMethod);
        if (!this._strategies[key]) {
            this._strategies[key] = this._createStrategy(paymentMethod);
        }
        return this._strategies[key];
    };
    PaymentStrategyRegistry.prototype._createStrategy = function (paymentMethod) {
        var factory = this._getFactory(paymentMethod);
        if (!factory) {
            throw new errors_1.PaymentMethodUnsupportedError(paymentMethod.id);
        }
        return factory(paymentMethod);
    };
    PaymentStrategyRegistry.prototype._getFactory = function (paymentMethod) {
        var key = this._getKey(paymentMethod);
        if (this._factories[key]) {
            return this._factories[key];
        }
        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return this._factories.offline;
        }
        if (this._isLegacyMethod(paymentMethod)) {
            return this._factories.legacy;
        }
        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return this._factories.offsite;
        }
        return this._factories.creditcard;
    };
    PaymentStrategyRegistry.prototype._getKey = function (paymentMethod) {
        return paymentMethod.gateway || paymentMethod.id;
    };
    PaymentStrategyRegistry.prototype._isLegacyMethod = function (paymentMethod) {
        if (!this._clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return false;
        }
        return !lodash_1.some(this._clientSidePaymentProviders, function (id) {
            return paymentMethod.id === id || paymentMethod.gateway === id;
        });
    };
    return PaymentStrategyRegistry;
}());
exports.default = PaymentStrategyRegistry;
//# sourceMappingURL=payment-strategy-registry.js.map