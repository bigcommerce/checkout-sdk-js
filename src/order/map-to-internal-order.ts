import { filter, find, reduce, some } from 'lodash';

import { AmountTransformer } from '../cart';
import { mapToInternalLineItems } from '../cart';
import { Checkout } from '../checkout';
import { mapToInternalCoupon, mapToInternalGiftCertificate, InternalGiftCertificate } from '../coupon';
import { mapToDiscountNotifications } from '../promotion';

import InternalOrder, { InternalGiftCertificateList, InternalOrderPayment } from './internal-order';
import mapToInternalIncompleteOrder from './map-to-internal-incomplete-order';
import Order, { DefaultOrderPayment, GiftCertificateOrderPayment, OrderPayment, OrderPayments } from './order';

export default function mapToInternalOrder(checkout: Checkout, order: Order): InternalOrder {
    const decimalPlaces = order.currency.decimalPlaces;
    const amountTransformer = new AmountTransformer(decimalPlaces);
    const discountedAmount = reduce(checkout.cart.discounts, (sum, discount) => {
        return sum + discount.discountedAmount;
    }, 0);
    // @todo: remove this once API returns shipping cost breakdown (CHECKOUT-3153)
    const shippingAmountBeforeDiscount = checkout.shippingCostTotal + getShippingDiscount(checkout);

    return {
        ...mapToInternalIncompleteOrder(order),
        id: order.orderId,
        items: mapToInternalLineItems(order.lineItems, order.currency.decimalPlaces, 'productId'),
        orderId: order.orderId,
        currency: order.currency.code,
        customerCanBeCreated: order.customerCreated,
        payment: mapToInteralOrderPayment(order.payments),
        subtotal: {
            amount: order.baseAmount,
            integerAmount: amountTransformer.toInteger(order.baseAmount),
        },
        coupon: {
            discountedAmount: reduce(order.coupons, (sum, coupon) => {
                return sum + coupon.discountedAmount;
            }, 0),
            coupons: order.coupons.map(mapToInternalCoupon),
        },
        discount: {
            amount: discountedAmount,
            integerAmount: amountTransformer.toInteger(discountedAmount),
        },
        discountNotifications: mapToDiscountNotifications(checkout.promotions),
        giftCertificate: mapToGiftCertificates(order.payments),
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.shippingCostTotal),
            amountBeforeDiscount: shippingAmountBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(shippingAmountBeforeDiscount),
        },
        storeCredit: {
            amount: mapToStoreCredit(order.payments),
        },
        taxSubtotal: {
            amount: checkout.taxTotal,
            integerAmount: amountTransformer.toInteger(checkout.taxTotal),
        },
        taxes: checkout.taxes,
        taxTotal: {
            amount: checkout.taxTotal,
            integerAmount: amountTransformer.toInteger(checkout.taxTotal),
        },
        handling: {
            amount: checkout.handlingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.handlingCostTotal),
        },
        grandTotal: {
            amount: order.orderAmount,
            integerAmount: order.orderAmountAsInteger,
        },
    };
}

function mapToStoreCredit(payments?: OrderPayments): number {
    const item = find(payments, { providerId: 'storecredit' });

    return item ? item.amount : 0;
}

function mapToGiftCertificates(payments?: OrderPayments): InternalGiftCertificateList {
    const items = filter(payments, { providerId: 'giftcertificate' }) as GiftCertificateOrderPayment[];

    return {
        totalDiscountedAmount: reduce(items, (sum, item) => item.amount + sum, 0),
        appliedGiftCertificates: items.map(item => ({
            code: item.detail.code,
            discountedAmount: item.amount,
            remainingBalance: 0,
            giftCertificate: {
                balance: 0,
                code: item.detail.code,
                purchaseDate: '',
            },
        })),
    };
}

function mapToInteralOrderPayment(payments?: OrderPayments): InternalOrderPayment {
    const item = find(payments, isDefaultOrderPayment) as DefaultOrderPayment;

    if (!item) {
        return {};
    }

    return {
        id: item.providerId,
        status: item.detail.step,
        helpText: item.detail.instructions,
    };
}

function isDefaultOrderPayment(payment: OrderPayment): payment is DefaultOrderPayment {
    return payment.providerId !== 'giftcertificate' && payment.providerId !== 'storecredit';
}

function getShippingDiscount(checkout: Checkout): number {
    const coupon = checkout.cart.coupons.find(coupon => coupon.couponType === 'shipping_discount');

    return coupon ? coupon.discountedAmount : 0;
}
