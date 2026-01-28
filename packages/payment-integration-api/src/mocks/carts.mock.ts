import { Cart, CartSource } from '../cart';
import { getDiscount } from '../discount/discounts.mock';

import { getCoupon } from './coupons.mock';
import { getCurrency } from './currency.mock';
import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from './line-items.mock';

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
        locale: 'en',
    };
}

export function getBuyNowCart(): Cart {
    return {
        ...getCart(),
        source: CartSource.BuyNow,
    };
}
