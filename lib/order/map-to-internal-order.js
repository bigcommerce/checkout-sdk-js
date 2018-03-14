"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var cart_1 = require("../cart");
var coupon_1 = require("../coupon");
var map_to_internal_incomplete_order_1 = require("./map-to-internal-incomplete-order");
function mapToInternalOrder(checkout, order, existingOrder) {
    return tslib_1.__assign({}, map_to_internal_incomplete_order_1.default(checkout, existingOrder), { id: order.orderId, items: cart_1.mapToInternalLineItems(order.lineItems, existingOrder.items), currency: order.currency.code, customerCanBeCreated: existingOrder.customerCanBeCreated, subtotal: {
            amount: existingOrder.subtotal.amount,
            integerAmount: existingOrder.subtotal.integerAmount,
        }, coupon: {
            discountedAmount: existingOrder.coupon.discountedAmount,
            coupons: checkout.cart.coupons.map(function (coupon) {
                return coupon_1.mapToInternalCoupon(coupon, lodash_1.find(existingOrder.coupon.coupons, { code: coupon.code }));
            }),
        }, discount: {
            amount: order.discountAmount,
            integerAmount: existingOrder.discount.integerAmount,
        }, discountNotifications: existingOrder.discountNotifications, giftCertificate: {
            totalDiscountedAmount: existingOrder.giftCertificate.totalDiscountedAmount,
            appliedGiftCertificates: checkout.giftCertificates.map(function (giftCertificate) {
                return coupon_1.mapToInternalGiftCertificate(giftCertificate, lodash_1.find(existingOrder.giftCertificate.appliedGiftCertificates, { code: giftCertificate.code }));
            }),
        }, shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: existingOrder.shipping.integerAmount,
            amountBeforeDiscount: existingOrder.shipping.amountBeforeDiscount,
            integerAmountBeforeDiscount: existingOrder.shipping.integerAmountBeforeDiscount,
            required: existingOrder.shipping.required,
        }, storeCredit: {
            amount: checkout.storeCredit,
        }, taxSubtotal: existingOrder.taxSubtotal, taxes: existingOrder.taxes, taxTotal: {
            amount: checkout.taxTotal,
            integerAmount: existingOrder.taxTotal.integerAmount,
        }, handling: {
            amount: existingOrder.handling.amount,
            integerAmount: existingOrder.handling.integerAmount,
        }, grandTotal: {
            amount: checkout.grandTotal,
            integerAmount: existingOrder.grandTotal.integerAmount,
        } });
}
exports.default = mapToInternalOrder;
//# sourceMappingURL=map-to-internal-order.js.map