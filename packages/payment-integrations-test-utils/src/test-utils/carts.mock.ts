import { Cart, CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCoupon } from './coupons.mock';
import { getCurrency } from './currency.mock';
import { getDiscount } from './discounts.mock';
import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from './line-items.mock';
import Order from '../../../core/src/order/order';
import { getBillingAddress } from '@bigcommerce/checkout-sdk/core';
import { getShippingCoupon } from '../../../core/src/coupon/coupons.mock';
import {
    getGatewayOrderPayment,
    getGiftCertificateOrderPayment,
    getOrderConsignment,
} from '../../../core/src/order/orders.mock';

export default function getCart(): Cart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        customerId: 4,
        currency: getCurrency(),
        email: 'foo@bar.com',
        isTaxIncluded: false,
        baseAmount: 200,
        discountAmount: 10,
        cartAmount: 190,
        coupons: [getCoupon()],
        discounts: [getDiscount()],
        lineItems: {
            physicalItems: [getPhysicalItem()],
            digitalItems: [getDigitalItem()],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [getCustomItem()],
        },
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}

export function getBuyNowCart(): Cart {
    return {
        ...getCart(),
        source: CartSource.BuyNow,
    };
}

export function getOrder(): Order {
    return {
        baseAmount: 200,
        billingAddress: getBillingAddress(),
        cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        consignments: getOrderConsignment(),
        coupons: [getCoupon(), getShippingCoupon()],
        currency: getCurrency(),
        customerMessage: '',
        customerCanBeCreated: true,
        customerId: 0,
        discountAmount: 10,
        handlingCostTotal: 8,
        hasDigitalItems: false,
        isComplete: true,
        isDownloadable: false,
        isTaxIncluded: false,
        lineItems: {
            physicalItems: [getPhysicalItem()],
            digitalItems: [],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [],
        },
        orderAmount: 190,
        orderAmountAsInteger: 19000,
        giftWrappingCostTotal: 0,
        orderId: 295,
        payments: [getGatewayOrderPayment(), getGiftCertificateOrderPayment()],
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        status: 'ORDER_STATUS_AWAITING_FULFILLMENT',
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        taxTotal: 3,
        channelId: 1,
        fees: [],
    };
}
