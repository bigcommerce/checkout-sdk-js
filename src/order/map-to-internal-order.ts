import { filter, find, keyBy, reduce } from 'lodash';

import { mapToInternalLineItems, LineItem } from '../cart';
import { Checkout } from '../checkout';
import { AmountTransformer } from '../common/utility';
import { mapToInternalCoupon } from '../coupon';
import { HOSTED } from '../payment';

import InternalOrder, { InternalGiftCertificateList, InternalIncompleteOrder, InternalOrderPayment, InternalSocialDataList } from './internal-order';
import Order, { GatewayOrderPayment, GiftCertificateOrderPayment, OrderPayment, OrderPayments } from './order';
import { OrderMetaState } from './order-state';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalOrder(order: Order, orderMeta: OrderMetaState = {}): InternalOrder {
    const decimalPlaces = order.currency.decimalPlaces;
    const amountTransformer = new AmountTransformer(decimalPlaces);

    return {
        id: order.orderId,
        items: mapToInternalLineItems(order.lineItems, order.currency.decimalPlaces, 'productId'),
        orderId: order.orderId,
        currency: order.currency.code,
        customerCanBeCreated: order.customerCanBeCreated,
        payment: mapToInternalOrderPayment(order.payments, orderMeta.payment),
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
            amount: order.discountAmount,
            integerAmount: amountTransformer.toInteger(order.discountAmount),
        },
        token: orderMeta.orderToken,
        callbackUrl: orderMeta.callbackUrl,
        discountNotifications: [],
        giftCertificate: mapToGiftCertificates(order.payments),
        socialData: mapToInternalSocialDataList(order),
        status: order.status,
        hasDigitalItems: order.hasDigitalItems,
        isDownloadable: order.isDownloadable,
        isComplete: order.isComplete,
        shipping: {
            amount: order.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(order.shippingCostTotal),
            amountBeforeDiscount: order.shippingCostBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(order.shippingCostBeforeDiscount),
        },
        storeCredit: {
            amount: mapToStoreCredit(order.payments),
        },
        taxes: order.taxes,
        taxTotal: {
            amount: order.taxTotal,
            integerAmount: amountTransformer.toInteger(order.taxTotal),
        },
        handling: {
            amount: order.handlingCostTotal,
            integerAmount: amountTransformer.toInteger(order.handlingCostTotal),
        },
        grandTotal: {
            amount: order.orderAmount,
            integerAmount: order.orderAmountAsInteger,
        },
    };
}

export function mapToInternalIncompleteOrder(checkout: Checkout): InternalIncompleteOrder {
    const payment = find(checkout.payments, { providerType: HOSTED });

    return {
        orderId: null,
        isComplete: false,
        payment: !payment ? {} : {
            id: payment.providerId,
            gateway: payment.gatewayId,
            status: mapToInternalPaymentStatus(payment.detail.step),
        },
    };
}

function mapToInternalPaymentStatus(status: string): string {
    return `PAYMENT_STATUS_${status}`;
}

function mapToStoreCredit(payments?: OrderPayments): number {
    const item = find(payments, { providerId: 'storecredit' });

    return item ? item.amount : 0;
}

function mapToGiftCertificates(payments?: OrderPayments): InternalGiftCertificateList {
    const items = filter(payments, { providerId: 'giftcertificate' }) as GiftCertificateOrderPayment[];

    return {
        totalDiscountedAmount: reduce(items, (sum, item) => item.amount + sum, 0),
        appliedGiftCertificates: keyBy(items.map(item => ({
            code: item.detail.code,
            discountedAmount: item.amount,
            remainingBalance: item.detail.remaining,
            giftCertificate: {
                balance: item.amount + item.detail.remaining,
                code: item.detail.code,
                purchaseDate: '',
            },
        })), 'code'),
    };
}

function mapToInternalOrderPayment(payments?: OrderPayments, payment: InternalOrderPayment = {}): InternalOrderPayment {
    const item = find(payments, isDefaultOrderPayment) as GatewayOrderPayment;

    if (!item) {
        return {};
    }

    return {
        id: item.providerId,
        status: mapToInternalPaymentStatus(item.detail.step),
        helpText: item.detail.instructions,
        returnUrl: payment.returnUrl,
    };
}

function isDefaultOrderPayment(payment: OrderPayment): payment is GatewayOrderPayment {
    return payment.providerId !== 'giftcertificate' && payment.providerId !== 'storecredit';
}

function mapToInternalSocialDataList(order: Order): { [itemId: string]: InternalSocialDataList } | undefined {
    const socialDataObject: { [itemId: string]: InternalSocialDataList } = {};
    const items = [
        ...order.lineItems.physicalItems,
        ...order.lineItems.digitalItems,
    ];

    items.forEach(item => {
        socialDataObject[item.id] = mapToInternalSocialData(item);
    });

    return socialDataObject;
}

function mapToInternalSocialData(lineItem: LineItem): InternalSocialDataList {
    const codes = ['fb', 'tw', 'gp'];

    return codes.reduce((socialData, code) => {
        const item = lineItem.socialMedia && find(lineItem.socialMedia, item => item.code === code);

        if (!item) {
            return socialData;
        }

        socialData[code] = {
            name: lineItem.name,
            description: lineItem.name,
            image: lineItem.imageUrl,
            url: item.link,
            shareText: item.text,
            sharingLink: item.link,
            channelName: item.channel,
            channelCode: item.code,
        };

        return socialData;
    }, {} as InternalSocialDataList);
}
