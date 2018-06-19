import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getGiftCertificateItem } from '../cart/line-items.mock';
import { getResponse } from '../common/http-request/responses.mock';
import { getCoupon, getShippingCoupon } from '../coupon/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';

import { getSubmitOrderResponseBody, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import { getPhysicalItem } from './line-items.mock';
import Order, { GatewayOrderPayment, GiftCertificateOrderPayment } from './order';
import OrderState from './order-state';

export function getOrder(): Order {
    return {
        baseAmount: 200,
        billingAddress: getBillingAddress(),
        cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        coupons: [
            getCoupon(),
            getShippingCoupon(),
        ],
        currency: getCurrency(),
        customerCanBeCreated: true,
        customerId: 0,
        discountAmount: 10,
        hasDigitalItems: false,
        isComplete: true,
        status: 'ORDER_STATUS_AWAITING_FULFILLMENT',
        isDownloadable: false,
        isTaxIncluded: false,
        lineItems: {
            physicalItems: [
                getPhysicalItem(),
            ],
            digitalItems: [],
            giftCertificates: [
                getGiftCertificateItem(),
            ],
        },
         taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        orderAmount: 190,
        orderAmountAsInteger: 19000,
        orderId: 295,
        payments: [
            getGatewayOrderPayment(),
            getGiftCertificateOrderPayment(),
        ],
    };
}

export function getGatewayOrderPayment(): GatewayOrderPayment {
    return {
        providerId: 'authorizenet',
        description: 'credit-card',
        amount: 190,
        detail: {
            step: 'FINALIZE',
            instructions: '%%OrderID%% text %%OrderID%%',
        },
    };
}

export function getGiftCertificateOrderPayment(): GiftCertificateOrderPayment {
    return {
        providerId: 'giftcertificate',
        description: 'gc',
        amount: 7,
        detail: {
            code: 'gc',
            remaining: 3,
        },
    };
}

export function getOrderState(): OrderState {
    const response = getResponse(
        getSubmitOrderResponseBody(),
        getSubmitOrderResponseHeaders()
    );

    return {
        data: getOrder(),
        meta: {
            deviceFingerprint: response.body.meta.deviceFingerprint,
            token: response.headers.token,
            payment: response.body.data.order.payment,
        },
        errors: {},
        statuses: {},
    };
}
