import { Cart } from '../cart';
import { getCurrency } from '../currency/currencies.mock';
import { getCoupon } from '../coupon/coupons.mock';
import { getDiscount } from '../discount/discounts.mock';
import { getPhysicalItem } from './line-items.mock';

export function getCart(): Cart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        customerId: 0,
        currency: getCurrency(),
        isTaxIncluded: false,
        baseAmount: 200,
        discountAmount: 10,
        cartAmount: 190,
        coupons: [
            getCoupon(),
        ],
        discounts: [
            getDiscount(),
        ],
        lineItems: {
            physicalItems: [
                getPhysicalItem(),
            ],
            digitalItems: [],
            giftCertificates: [],
        },
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}
