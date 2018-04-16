import { find } from 'lodash';

import { mapToInternalLineItems } from '../cart';
import { Checkout } from '../checkout';
import { mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';

import { default as InternalOrder } from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';
import Order from './order';

export default function mapToInternalOrder(checkout: Checkout, order: Order, existingOrder: InternalOrder): InternalOrder {
    return {
        ...mapToInternalIncompleteOrder(checkout, existingOrder),
        id: order.orderId,
        items: mapToInternalLineItems(order.lineItems, existingOrder.items),
        currency: order.currency.code,
        customerCanBeCreated: existingOrder.customerCanBeCreated,
        subtotal: {
            amount: existingOrder.subtotal.amount,
            integerAmount: existingOrder.subtotal.integerAmount,
        },
        coupon: {
            discountedAmount: existingOrder.coupon.discountedAmount,
            coupons: checkout.cart.coupons.map(coupon =>
                mapToInternalCoupon(
                    coupon,
                    find(existingOrder.coupon.coupons, { code: coupon.code })!
                )
            ),
        },
        discount: {
            amount: order.discountAmount,
            integerAmount: existingOrder.discount.integerAmount,
        },
        discountNotifications: existingOrder.discountNotifications,
        giftCertificate: {
            totalDiscountedAmount: existingOrder.giftCertificate.totalDiscountedAmount,
            appliedGiftCertificates: checkout.giftCertificates.map(giftCertificate =>
                mapToInternalGiftCertificate(
                    giftCertificate,
                    find(existingOrder.giftCertificate.appliedGiftCertificates, { code: giftCertificate.code })!
                )
            ),
        },
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: existingOrder.shipping.integerAmount,
            amountBeforeDiscount: existingOrder.shipping.amountBeforeDiscount,
            integerAmountBeforeDiscount: existingOrder.shipping.integerAmountBeforeDiscount,
            required: existingOrder.shipping.required,
        },
        storeCredit: {
            amount: checkout.storeCredit,
        },
        taxSubtotal: existingOrder.taxSubtotal,
        taxes: existingOrder.taxes,
        taxTotal: {
            amount: checkout.taxTotal,
            integerAmount: existingOrder.taxTotal.integerAmount,
        },
        handling: {
            amount: existingOrder.handling.amount,
            integerAmount: existingOrder.handling.integerAmount,
        },
        grandTotal: {
            amount: checkout.grandTotal,
            integerAmount: existingOrder.grandTotal.integerAmount,
        },
    };
}
