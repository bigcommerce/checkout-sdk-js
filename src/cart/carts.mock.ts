import { Cart, CartState } from '../cart';
import { getCoupon, getShippingCoupon } from '../coupon/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';
import { getDiscount } from '../discount/discounts.mock';

import { getDigitalItem, getGiftCertificateItem, getPhysicalItem } from './line-items.mock';

export function getCart(): Cart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        customerId: 4,
        currency: getCurrency(),
        email: 'foo@bar.com',
        isTaxIncluded: false,
        baseAmount: 200,
        discountAmount: 10,
        cartAmount: 190,
        coupons: [
            getCoupon(),
            getShippingCoupon(),
        ],
        discounts: [
            getDiscount(),
        ],
        lineItems: {
            physicalItems: [
                getPhysicalItem(),
            ],
            digitalItems: [
                getDigitalItem(),
            ],
            giftCertificates: [
                getGiftCertificateItem(),
            ],
            customItems: [],
        },
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}

export function getCartState(): CartState {
    return {
        data: getCart(),
        errors: {},
        statuses: {},
    };
}
