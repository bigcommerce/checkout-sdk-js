import { keyBy, reduce, some } from 'lodash';

import { Checkout } from '../checkout';
import { AmountTransformer } from '../common/utility';
import { mapToInternalCoupon, mapToInternalGiftCertificate } from '../coupon';
import { mapToDiscountNotifications } from '../promotion';

import InternalCart from './internal-cart';
import mapToInternalLineItems from './map-to-internal-line-items';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalCart(checkout: Checkout): InternalCart {
    const decimalPlaces = checkout.cart.currency.decimalPlaces;
    const amountTransformer = new AmountTransformer(decimalPlaces);

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
            amount: checkout.cart.discountAmount,
            integerAmount: amountTransformer.toInteger(checkout.cart.discountAmount),
        },
        discountNotifications: mapToDiscountNotifications(checkout.promotions),
        giftCertificate: {
            totalDiscountedAmount: reduce(checkout.giftCertificates, (sum, certificate) => {
                return sum + certificate.used;
            }, 0),
            appliedGiftCertificates: keyBy(checkout.giftCertificates.map(mapToInternalGiftCertificate), 'code'),
        },
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.shippingCostTotal),
            amountBeforeDiscount: checkout.shippingCostBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(checkout.shippingCostBeforeDiscount),
            required: some(checkout.cart.lineItems.physicalItems, lineItem => lineItem.isShippingRequired),
        },
        subtotal: {
            amount: checkout.subtotal,
            integerAmount: amountTransformer.toInteger(checkout.subtotal),
        },
        storeCredit: {
            amount: checkout.customer ? checkout.customer.storeCredit : 0,
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
