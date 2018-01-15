"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var PaymentMethodSelector = (function () {
    function PaymentMethodSelector(paymentMethods, order) {
        if (paymentMethods === void 0) { paymentMethods = {}; }
        if (order === void 0) { order = {}; }
        this._paymentMethods = paymentMethods;
        this._order = order;
    }
    PaymentMethodSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods.data;
    };
    PaymentMethodSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        var predicate = gatewayId ?
            { id: methodId, gateway: gatewayId } :
            { id: methodId };
        return lodash_1.find(this._paymentMethods.data, predicate);
    };
    PaymentMethodSelector.prototype.getSelectedPaymentMethod = function () {
        if (!this._order.data || !this._order.data.payment) {
            return;
        }
        return this.getPaymentMethod(this._order.data.payment.id, this._order.data.payment.gateway);
    };
    PaymentMethodSelector.prototype.getLoadError = function () {
        return this._paymentMethods.errors && this._paymentMethods.errors.loadError;
    };
    PaymentMethodSelector.prototype.getLoadMethodError = function (methodId) {
        if (!this._paymentMethods.errors ||
            (methodId && this._paymentMethods.errors.failedMethod !== methodId)) {
            return;
        }
        return this._paymentMethods.errors.loadMethodError;
    };
    PaymentMethodSelector.prototype.isLoading = function () {
        return !!(this._paymentMethods.statuses && this._paymentMethods.statuses.isLoading);
    };
    PaymentMethodSelector.prototype.isLoadingMethod = function (methodId) {
        if (!this._paymentMethods.statuses ||
            (methodId && this._paymentMethods.statuses.loadingMethod !== methodId)) {
            return false;
        }
        return !!this._paymentMethods.statuses.isLoadingMethod;
    };
    return PaymentMethodSelector;
}());
exports.default = PaymentMethodSelector;
//# sourceMappingURL=payment-method-selector.js.map