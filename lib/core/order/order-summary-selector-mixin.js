"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
/**
 * @mixin
 */
var OrderSummarySelectorMixin = /** @class */ (function () {
    function OrderSummarySelectorMixin() {
    }
    /**
     * @property {CartSummary} _summary
     */
    /**
     * @return {CartItem[]}
     */
    OrderSummarySelectorMixin.prototype.getItems = function () {
        return this._summary.items || [];
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getItemsCount = function () {
        return lodash_1.reduce(this.getItems(), function (sum, item) { return sum + item.quantity; }, 0);
    };
    /**
     * @return {Coupon[]}
     */
    OrderSummarySelectorMixin.prototype.getCoupons = function () {
        return this._summary.coupon && this._summary.coupon.coupons || [];
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getCouponsDiscountedAmount = function () {
        return this._summary.coupon && this._summary.coupon.discountedAmount || 0;
    };
    /**
     * @return {GiftCertificate[]}
     */
    OrderSummarySelectorMixin.prototype.getGiftCertificates = function () {
        return this._summary.giftCertificate && this._summary.giftCertificate.appliedGiftCertificates || [];
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getDiscount = function () {
        return this._summary.discount && this._summary.discount.amount || 0;
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getGrandTotal = function () {
        return this._summary.grandTotal && this._summary.grandTotal.amount || 0;
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getSubtotal = function () {
        return this._summary.subtotal && this._summary.subtotal.amount || 0;
    };
    /**
     * @return {Tax[]}
     */
    OrderSummarySelectorMixin.prototype.getTaxes = function () {
        return this._summary.taxes || [];
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getShippingCost = function () {
        return this._summary && this._summary.shipping && this._summary.shipping.amountBeforeDiscount || 0;
    };
    /**
     * @return {number}
     */
    OrderSummarySelectorMixin.prototype.getHandlingFee = function () {
        return this._summary.handling && this._summary.handling.amount || 0;
    };
    /**
     * @return {boolean}
     */
    OrderSummarySelectorMixin.prototype.isShippingRequired = function () {
        return !!(this._summary.shipping && this._summary.shipping.required);
    };
    return OrderSummarySelectorMixin;
}());
exports.default = OrderSummarySelectorMixin;
//# sourceMappingURL=order-summary-selector-mixin.js.map