import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getCurrency } from '../currency/currencies.mock';
import { getCoupon } from '../coupon/coupons.mock';
import { getDiscount } from '../discount/discounts.mock';
import { getPhysicalItem } from '../cart/line-items.mock';
import Order from './order';

export function getOrder(): Order {
    return {
        baseAmount: 200,
        billingAddress: getBillingAddress(),
        cartId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        coupons: [
            getCoupon(),
        ],
        currency: getCurrency(),
        customerCreated: false,
        customerId: 0,
        discountAmount: 10,
        hasDigitalItems: false,
        isComplete: true,
        isDownloadable: false,
        isTaxIncluded: false,
        lineItems: {
            physicalItems: [
                getPhysicalItem(),
            ],
            digitalItems: [],
            giftCertificates: [],
        },
        orderAmount: 190,
        orderId: 295,
        status: 'ORDER_STATUS_AWAITING_FULFILLMENT',
    };
}
