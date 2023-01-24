import { Checkout } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getBillingAddress } from './address.mock';
import getCart, { getBuyNowCart } from './carts.mock';
import getConsignment from './consignment.mock';
import { getCustomer } from './customer.mock';

export default function getCheckout(): Checkout {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        cart: getCart(),
        customer: getCustomer(),
        customerMessage: 'comment',
        billingAddress: getBillingAddress(),
        consignments: [getConsignment()],
        taxes: [
            {
                name: 'Tax',
                amount: 3,
            },
        ],
        discounts: [],
        coupons: [],
        isStoreCreditApplied: false,
        shouldExecuteSpamCheck: false,
        orderId: 295,
        shippingCostTotal: 15,
        shippingCostBeforeDiscount: 20,
        handlingCostTotal: 8,
        taxTotal: 3,
        subtotal: 190,
        grandTotal: 190,
        giftWrappingCostTotal: 0,
        outstandingBalance: 190,
        giftCertificates: [],
        balanceDue: 0,
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
        promotions: [
            {
                banners: [
                    {
                        type: 'upsell',
                        text: 'foo',
                    },
                ],
            },
        ],
    };
}

export function getCheckoutWithBuyNowCart() {
    return {
        ...getCheckout(),
        cart: getBuyNowCart(),
    };
}
