import { filter, find, keyBy, reduce } from 'lodash';

import { AmountTransformer, LineItem } from '../cart';
import { mapToInternalLineItems } from '../cart';
import { mapToInternalCoupon } from '../coupon';

import InternalOrder, { InternalGiftCertificateList, InternalOrderPayment, InternalSocialDataList } from './internal-order';
import Order, { DefaultOrderPayment, GiftCertificateOrderPayment, OrderPayment, OrderPayments } from './order';

export default function mapToInternalOrder(order: Order): InternalOrder {
    const decimalPlaces = order.currency.decimalPlaces;
    const amountTransformer = new AmountTransformer(decimalPlaces);

    return {
        id: order.orderId,
        items: mapToInternalLineItems(order.lineItems, order.currency.decimalPlaces, 'productId'),
        orderId: order.orderId,
        currency: order.currency.code,
        customerCanBeCreated: order.customerCanBeCreated,
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
            amount: order.discountAmount,
            integerAmount: amountTransformer.toInteger(order.discountAmount),
        },
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

function mapToInteralOrderPayment(payments?: OrderPayments): InternalOrderPayment {
    const item = find(payments, isDefaultOrderPayment) as DefaultOrderPayment;

    if (!item) {
        return {};
    }

    return {
        id: item.providerId,
        status: `PAYMENT_STATUS_${item.detail.step}`,
        helpText: item.detail.instructions,
    };
}

function isDefaultOrderPayment(payment: OrderPayment): payment is DefaultOrderPayment {
    return payment.providerId !== 'giftcertificate' && payment.providerId !== 'storecredit';
}

export function mapToInternalSocialDataList(order: Order): { [itemId: string]: InternalSocialDataList } | undefined {
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

export function mapToInternalSocialData(lineItem: LineItem): InternalSocialDataList {
    const codes = ['fb', 'tw', 'gp'];

    return codes.reduce((socialData, code) => {
        const item = lineItem.socialMedia && lineItem.socialMedia.find(item => item.code === code);

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
