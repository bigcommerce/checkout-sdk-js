import { find } from 'lodash';
import InternalOrder from './internal-order';
import { mapToInternalCart, mapToInternalLineItems } from '../cart';
import { Coupon, mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';
import Order from './order';

export default function mapFromOrderToInternal(order: Order, fallbackOrder: InternalOrder): InternalOrder {
    return {
        id: order.orderId,
        orderId: order.orderId,
        items: mapToInternalLineItems(order.lineItems, fallbackOrder.items),
        currency: order.currency.code,
        customerCanBeCreated: fallbackOrder.customerCanBeCreated,
        token: fallbackOrder.token,
        payment: fallbackOrder.payment,
        socialData: fallbackOrder.socialData,
        customerCreated: order.customerCreated,
        hasDigitalItems: order.hasDigitalItems,
        isDownloadable: order.isDownloadable,
        isComplete: order.isComplete,
        callbackUrl: fallbackOrder.callbackUrl,
        status: fallbackOrder.status,
        subtotal: {
            amount: fallbackOrder.subtotal.amount,
            integerAmount: fallbackOrder.subtotal.integerAmount,
        },
        coupon: {
            discountedAmount: fallbackOrder.coupon.discountedAmount,
            coupons: order.coupons.map(coupon =>
                mapToInternalCoupon(
                    coupon,
                    find(fallbackOrder.coupon.coupons, { code: coupon.code })!
                )
            ),
        },
        discount: {
            amount: order.discountAmount,
            integerAmount: fallbackOrder.discount.integerAmount,
        },
        discountNotifications: fallbackOrder.discountNotifications,
        giftCertificate: {
            totalDiscountedAmount: fallbackOrder.giftCertificate.totalDiscountedAmount,
            appliedGiftCertificates: fallbackOrder.giftCertificate.appliedGiftCertificates,
        },
        shipping: {
            amount: fallbackOrder.shipping.amount,
            integerAmount: fallbackOrder.shipping.integerAmount,
            amountBeforeDiscount: fallbackOrder.shipping.amountBeforeDiscount,
            integerAmountBeforeDiscount: fallbackOrder.shipping.integerAmountBeforeDiscount,
            required: fallbackOrder.shipping.required,
        },
        storeCredit: {
            amount: fallbackOrder.storeCredit.amount,
        },
        taxSubtotal: fallbackOrder.taxSubtotal,
        taxes: fallbackOrder.taxes,
        taxTotal: {
            amount: fallbackOrder.taxTotal.amount,
            integerAmount: fallbackOrder.taxTotal.integerAmount,
        },
        handling: {
            amount: fallbackOrder.handling.amount,
            integerAmount: fallbackOrder.handling.integerAmount,
        },
        grandTotal: {
            amount: order.orderAmount,
            integerAmount: fallbackOrder.grandTotal.integerAmount,
        },
    };
}
