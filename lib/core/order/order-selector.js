"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var paymentStatusTypes = require("../payment/payment-status-types");
var OrderSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {OrderState} order
     * @param {PaymentState} payment
     * @param {CustomerState} customer
     * @param {CartState} cart
     */
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
    /**
     * @return {Order}
     */
    OrderSelector.prototype.getOrder = function () {
        return this._order.data;
    };
    /**
     * @return {Object}
     */
    OrderSelector.prototype.getOrderMeta = function () {
        return lodash_1.pick(this._order.meta, 'deviceFingerprint');
    };
    /**
     * @return {?string}
     */
    OrderSelector.prototype.getPaymentAuthToken = function () {
        return this._order.meta && this._order.meta.token;
    };
    /**
     * @param {boolean} useStoreCredit
     * @return {boolean}
     */
    OrderSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        var grandTotal = this._cart.data.grandTotal && this._cart.data.grandTotal.amount || 0;
        var storeCredit = this._customer.data.storeCredit || 0;
        return (useStoreCredit ? grandTotal - storeCredit : grandTotal) > 0;
    };
    /**
     * @param {PaymentMethod} paymentMethod
     * @return {boolean}
     */
    OrderSelector.prototype.isPaymentDataSubmitted = function (paymentMethod) {
        if (paymentMethod === void 0) { paymentMethod = {}; }
        var _a = this.getOrder().payment, payment = _a === void 0 ? {} : _a;
        return !!paymentMethod.nonce ||
            payment.status === paymentStatusTypes.ACKNOWLEDGE ||
            payment.status === paymentStatusTypes.FINALIZE;
    };
    /**
     * @return {?ErrorResponse}
     */
    OrderSelector.prototype.getLoadError = function () {
        return this._order.errors && this._order.errors.loadError;
    };
    /**
     * @return {?ErrorResponse}
     */
    OrderSelector.prototype.getSubmitError = function () {
        return ((this._order.errors && this._order.errors.submitError) ||
            (this._payment.errors && this._payment.errors.submitError));
    };
    /**
     * @return {?ErrorResponse}
     */
    OrderSelector.prototype.getFinalizeError = function () {
        return this._order.errors && this._order.errors.finalizeError;
    };
    /**
     * @return {boolean}
     */
    OrderSelector.prototype.isLoading = function () {
        return !!(this._order.statuses && this._order.statuses.isLoading);
    };
    /**
     * @return {boolean}
     */
    OrderSelector.prototype.isSubmitting = function () {
        return !!((this._order.statuses && this._order.statuses.isSubmitting) ||
            (this._payment.statuses && this._payment.statuses.isSubmitting));
    };
    /**
     * @return {boolean}
     */
    OrderSelector.prototype.isFinalizing = function () {
        return !!(this._order.statuses && this._order.statuses.isFinalizing);
    };
    return OrderSelector;
}());
exports.default = OrderSelector;
//# sourceMappingURL=order-selector.js.map