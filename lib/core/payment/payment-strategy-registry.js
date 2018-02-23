"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var registry_1 = require("../common/registry");
var paymentMethodTypes = require("./payment-method-types");
var PaymentStrategyRegistry = (function (_super) {
    tslib_1.__extends(PaymentStrategyRegistry, _super);
    function PaymentStrategyRegistry(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this._clientSidePaymentProviders = options.clientSidePaymentProviders;
        return _this;
    }
    PaymentStrategyRegistry.prototype.getByMethod = function (paymentMethod) {
        var token = this._getToken(paymentMethod);
        var cacheToken = paymentMethod.gateway || paymentMethod.id;
        return this.get(token, cacheToken);
    };
    PaymentStrategyRegistry.prototype._getToken = function (paymentMethod) {
        var methodId = paymentMethod.gateway || paymentMethod.id;
        if (this.hasFactory(methodId)) {
            return methodId;
        }
        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return 'offline';
        }
        if (this._isLegacyMethod(paymentMethod)) {
            return 'legacy';
        }
        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return 'offsite';
        }
        return 'creditcard';
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
}(registry_1.Registry));
exports.default = PaymentStrategyRegistry;
//# sourceMappingURL=payment-strategy-registry.js.map