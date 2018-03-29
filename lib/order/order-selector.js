"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paymentStatusTypes = require("../payment/payment-status-types");
var OrderSelector = (function () {
    function OrderSelector(order, payment, customer, cart) {
        if (order === void 0) { order = {}; }
        if (payment === void 0) { payment = {}; }
        if (customer === void 0) { customer = {}; }
        if (cart === void 0) { cart = {}; }
        this._order = order;
        this._payment = payment;
        this._customer = customer;
        this._cart = cart;
    }
    OrderSelector.prototype.getOrder = function () {
        return this._order.data;
    };
    OrderSelector.prototype.getOrderMeta = function () {
        return {
            deviceFingerprint: this._order.meta && this._order.meta.deviceFingerprint,
        };
    };
    OrderSelector.prototype.getPaymentAuthToken = function () {
        return this._order.meta && this._order.meta.token;
    };
    OrderSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        var grandTotal = this._cart.data && this._cart.data.grandTotal && this._cart.data.grandTotal.amount || 0;
        var storeCredit = this._customer.data && this._customer.data.storeCredit || 0;
        return (useStoreCredit ? grandTotal - storeCredit : grandTotal) > 0;
    };
    OrderSelector.prototype.isPaymentDataSubmitted = function (paymentMethod) {
        if (paymentMethod === void 0) { paymentMethod = {}; }
        var _a = (this.getOrder() || {}).payment, payment = _a === void 0 ? {} : _a;
        return !!paymentMethod.nonce ||
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE;
    };
    OrderSelector.prototype.getLoadError = function () {
        return this._order.errors && this._order.errors.loadError;
    };
    OrderSelector.prototype.isLoading = function () {
        return !!(this._order.statuses && this._order.statuses.isLoading);
    };
    return OrderSelector;
}());
exports.default = OrderSelector;
//# sourceMappingURL=order-selector.js.map