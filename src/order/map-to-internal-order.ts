import { reduce } from 'lodash';

import { mapToInternalLineItems } from '../cart';
import { Checkout } from '../checkout';
import { mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';

import InternalOrder from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';
import Order from './order';

export default function mapToInternalOrder(checkout: Checkout, order: Order, existingOrder: InternalOrder): InternalOrder {
    return {
        ...mapToInternalIncompleteOrder(checkout, existingOrder),
        id: order.orderId,
        items: mapToInternalLineItems(order.lineItems, order.currency.decimalPlaces, 'productId'),
        currency: order.currency.code,
        customerCanBeCreated: existingOrder.customerCanBeCreated,
        subtotal: {
            amount: existingOrder.subtotal.amount,
            integerAmount: existingOrder.subtotal.integerAmount,
        },
        coupon: {
            discountedAmount: reduce(checkout.cart.coupons, (sum, coupon) => {
                return sum + coupon.discountedAmount;
            }, 0),
            coupons: checkout.cart.coupons.map(mapToInternalCoupon),
        },
        discount: {
            amount: order.discountAmount,
            integerAmount: existingOrder.discount.integerAmount,
        },
        discountNotifications: existingOrder.discountNotifications,
        giftCertificate: {
            totalDiscountedAmount: reduce(checkout.giftCertificates, (sum, certificate) => {
                return sum + certificate.used;
            }, 0),
            appliedGiftCertificates: checkout.giftCertificates.map(mapToInternalGiftCertificate),
        },
        shipping: {
            amount: existingOrder.shipping.amount,
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
