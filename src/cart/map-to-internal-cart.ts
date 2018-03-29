import { find } from 'lodash';

import { Checkout } from '../checkout';
import { mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';

import InternalCart from './internal-cart';
import mapToInternalLineItems from './map-to-internal-line-items';

export default function mapToInternalCart(checkout: Checkout, existingCart: InternalCart): InternalCart {
    return {
        id: checkout.cart.id,
        items: mapToInternalLineItems(checkout.cart.lineItems, existingCart.items),
        currency: checkout.cart.currency.code,
        subtotal: existingCart.subtotal,
        coupon: {
            discountedAmount: existingCart.coupon.discountedAmount,
            coupons: checkout.cart.coupons.map((coupon) =>
                mapToInternalCoupon(
                    coupon,
                    find(existingCart.coupon.coupons, { code: coupon.code })!
                )
            ),
        },
        discount: {
            amount: checkout.cart.discountAmount,
            integerAmount: existingCart.discount.integerAmount,
        },
        discountNotifications: existingCart.discountNotifications,
        giftCertificate: {
            totalDiscountedAmount: existingCart.giftCertificate.totalDiscountedAmount,
            appliedGiftCertificates: checkout.giftCertificates.map((giftCertificate) =>
                mapToInternalGiftCertificate(
                    giftCertificate,
                    find(existingCart.giftCertificate.appliedGiftCertificates, { code: giftCertificate.code })!
                )
            ),
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
