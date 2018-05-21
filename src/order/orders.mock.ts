import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getGiftCertificateItem } from '../cart/line-items.mock';
import { getCoupon, getShippingCoupon } from '../coupon/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';

import { getPhysicalItem } from './line-items.mock';
import Order from './order';

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
        status: 'ORDER_STATUS_INCOMPLETE',
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
            {
                providerId: 'authorizenet',
                description: 'credit-card',
                amount: 190,
                detail: {
                    step: 'PAYMENT_STATUS_FINALIZE',
                    instructions: '%%OrderID%% text %%OrderID%%',
                },
            },
            {
                providerId: 'giftcertificate',
                description: 'Gift Certificate',
                amount: 7,
                detail: {
                    code: 'gc',
                    remaining: 3,
                },
            },
        ],
    };
}
