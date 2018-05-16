import { reduce, some } from 'lodash';

import { Checkout } from '../checkout';
import { mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';
import { mapToDiscountNotifications } from '../promotion';

import { AmountTransformer } from '.';
import InternalCart from './internal-cart';
import mapToInternalLineItems from './map-to-internal-line-items';

export default function mapToInternalCart(checkout: Checkout): InternalCart {
    const decimalPlaces = checkout.cart.currency.decimalPlaces;
    const amountTransformer = new AmountTransformer(decimalPlaces);
    const discountedAmount = reduce(checkout.cart.discounts, (sum, discount) => {
        return sum + discount.discountedAmount;
    }, 0);
    // @todo: remove this once API returns shipping cost breakdown (CHECKOUT-3153)
    const shippingAmountBeforeDiscount = checkout.shippingCostTotal + getShippingDiscount(checkout);

    return {
        id: checkout.cart.id,
        items: mapToInternalLineItems(checkout.cart.lineItems, decimalPlaces),
        currency: checkout.cart.currency.code,
        coupon: {
            discountedAmount: reduce(checkout.cart.coupons, (sum, coupon) => {
                return sum + coupon.discountedAmount;
            }, 0),
            coupons: checkout.cart.coupons.map(mapToInternalCoupon),
        },
        discount: {
            amount: discountedAmount,
            integerAmount: amountTransformer.toInteger(discountedAmount),
        },
        discountNotifications: mapToDiscountNotifications(checkout.promotions),
        giftCertificate: {
            totalDiscountedAmount: reduce(checkout.giftCertificates, (sum, certificate) => {
                return sum + certificate.used;
            }, 0),
            appliedGiftCertificates: checkout.giftCertificates.map(mapToInternalGiftCertificate),
        },
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.shippingCostTotal),
            amountBeforeDiscount: shippingAmountBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(shippingAmountBeforeDiscount),
            required: some(checkout.cart.lineItems.physicalItems, lineItem => lineItem.isShippingRequired),
        },
        subtotal: {
            amount: checkout.cart.baseAmount,
            integerAmount: amountTransformer.toInteger(checkout.cart.baseAmount),
        },
        storeCredit: {
            amount: checkout.storeCredit,
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
            amount: checkout.grandTotal,
            integerAmount: amountTransformer.toInteger(checkout.grandTotal),
        },
    };
}

function getShippingDiscount(checkout: Checkout): number {
    const coupon = checkout.cart.coupons.find(coupon => coupon.couponType === 'shipping_discount');

    return coupon ? coupon.discountedAmount : 0;
}
