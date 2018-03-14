"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var coupon_1 = require("../coupon");
var map_to_internal_line_items_1 = require("./map-to-internal-line-items");
function mapToInternalCart(checkout, existingCart) {
    return {
        id: checkout.cart.id,
        items: map_to_internal_line_items_1.default(checkout.cart.lineItems, existingCart.items),
        currency: checkout.cart.currency.code,
        subtotal: existingCart.subtotal,
        coupon: {
            discountedAmount: existingCart.coupon.discountedAmount,
            coupons: checkout.cart.coupons.map(function (coupon) {
                return coupon_1.mapToInternalCoupon(coupon, lodash_1.find(existingCart.coupon.coupons, { code: coupon.code }));
            }),
        },
        discount: {
            amount: checkout.cart.discountAmount,
            integerAmount: existingCart.discount.integerAmount,
        },
        discountNotifications: existingCart.discountNotifications,
        giftCertificate: {
            totalDiscountedAmount: existingCart.giftCertificate.totalDiscountedAmount,
            appliedGiftCertificates: checkout.giftCertificates.map(function (giftCertificate) {
                return coupon_1.mapToInternalGiftCertificate(giftCertificate, lodash_1.find(existingCart.giftCertificate.appliedGiftCertificates, { code: giftCertificate.code }));
            }),
        },
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: existingCart.shipping.integerAmount,
            amountBeforeDiscount: existingCart.shipping.amountBeforeDiscount,
            integerAmountBeforeDiscount: existingCart.shipping.integerAmountBeforeDiscount,
            required: existingCart.shipping.required,
        },
        storeCredit: {
            amount: checkout.storeCredit,
        },
        taxSubtotal: existingCart.taxSubtotal,
        taxes: existingCart.taxes,
        taxTotal: {
            amount: checkout.taxTotal,
            integerAmount: existingCart.taxTotal.integerAmount,
        },
        handling: existingCart.handling,
        grandTotal: {
            amount: checkout.grandTotal,
            integerAmount: existingCart.grandTotal.integerAmount,
        },
    };
}
exports.default = mapToInternalCart;
//# sourceMappingURL=map-to-internal-cart.js.map