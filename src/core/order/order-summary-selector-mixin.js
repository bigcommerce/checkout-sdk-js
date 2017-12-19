import { reduce } from 'lodash';

/**
 * @mixin
 */
export default class OrderSummarySelectorMixin {
    /**
     * @property {CartSummary} _summary
     */

    /**
     * @return {CartItem[]}
     */
    getItems() {
        return this._summary.items || [];
    }

    /**
     * @return {number}
     */
    getItemsCount() {
        return reduce(this.getItems(), (sum, item) => sum + item.quantity, 0);
    }

    /**
     * @return {Coupon[]}
     */
    getCoupons() {
        return this._summary.coupon && this._summary.coupon.coupons || [];
    }

    /**
     * @return {number}
     */
    getCouponsDiscountedAmount() {
        return this._summary.coupon && this._summary.coupon.discountedAmount || 0;
    }

    /**
     * @return {GiftCertificate[]}
     */
    getGiftCertificates() {
        return this._summary.giftCertificate && this._summary.giftCertificate.appliedGiftCertificates || [];
    }

    /**
     * @return {number}
     */
    getDiscount() {
        return this._summary.discount && this._summary.discount.amount || 0;
    }

    /**
     * @return {number}
     */
    getGrandTotal() {
        return this._summary.grandTotal && this._summary.grandTotal.amount || 0;
    }

    /**
     * @return {number}
     */
    getSubtotal() {
        return this._summary.subtotal && this._summary.subtotal.amount || 0;
    }

    /**
     * @return {Tax[]}
     */
    getTaxes() {
        return this._summary.taxes || [];
    }

    /**
     * @return {number}
     */
    getShippingCost() {
        return this._summary && this._summary.shipping && this._summary.shipping.amountBeforeDiscount || 0;
    }

    /**
     * @return {number}
     */
    getHandlingFee() {
        return this._summary.handling && this._summary.handling.amount || 0;
    }

    /**
     * @return {boolean}
     */
    isShippingRequired() {
        return !!(this._summary.shipping && this._summary.shipping.required);
    }
}
