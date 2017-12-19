"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var PaymentMethodSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {PaymentMethodsState} paymentMethods
     * @param {OrderState} order
     */
    function PaymentMethodSelector(paymentMethods, order) {
        if (paymentMethods === void 0) { paymentMethods = {}; }
        if (order === void 0) { order = {}; }
        this._paymentMethods = paymentMethods.data;
        this._order = order.data;
        this._errors = paymentMethods.errors;
        this._statuses = paymentMethods.statuses;
    }
    /**
     * @return {PaymentMethod[]}
     */
    PaymentMethodSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods;
    };
    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {?PaymentMethod}
     */
    PaymentMethodSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        var predicate = gatewayId ? { id: methodId, gateway: gatewayId } : { id: methodId };
        return lodash_1.find(this._paymentMethods, predicate);
    };
    /**
     * @return {?PaymentMethod}
     */
    PaymentMethodSelector.prototype.getSelectedPaymentMethod = function () {
        if (!this._order.payment) {
            return;
        }
        return this.getPaymentMethod(this._order.payment.id, this._order.payment.gateway);
    };
    /**
     * @return {?ErrorResponse}
     */
    PaymentMethodSelector.prototype.getLoadError = function () {
        return this._errors && this._errors.loadError;
    };
    /**
     * @param {string} [methodId]
     * @return {?ErrorResponse}
     */
    PaymentMethodSelector.prototype.getLoadMethodError = function (methodId) {
        if (!this._errors || (methodId && this._errors.failedMethod !== methodId)) {
            return;
        }
        return this._errors.loadMethodError;
    };
    /**
     * @return {boolean}
     */
    PaymentMethodSelector.prototype.isLoading = function () {
        return !!(this._statuses && this._statuses.isLoading);
    };
    /**
     * @param {string} [methodId]
     * @return {boolean}
     */
    PaymentMethodSelector.prototype.isLoadingMethod = function (methodId) {
        if (!this._statuses || (methodId && this._statuses.loadingMethod !== methodId)) {
            return false;
        }
        return !!this._statuses.isLoadingMethod;
    };
    return PaymentMethodSelector;
}());
exports.default = PaymentMethodSelector;
//# sourceMappingURL=payment-method-selector.js.map