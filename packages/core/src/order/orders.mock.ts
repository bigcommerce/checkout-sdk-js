import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getGiftCertificateItem } from '../cart/line-items.mock';
import { getCoupon, getShippingCoupon } from '../coupon/coupons.mock';
import { getCurrency } from '../currency/currencies.mock';

import { getAwaitingOrder, getSubmitOrderResponseHeaders } from './internal-orders.mock';
import { getPhysicalItem } from './line-items.mock';
import Order, {
    GatewayOrderPayment,
    GiftCertificateOrderPayment,
    OrderConsignment,
    OrderShippingConsignment,
} from './order';
import OrderState, { OrderMetaState } from './order-state';

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

export function getOrderMeta(): OrderMetaState {
    const { token } = getSubmitOrderResponseHeaders();
    const { token: orderToken, callbackUrl, payment } = getAwaitingOrder();

    return {
        token,
        orderToken,
        callbackUrl,
        payment,
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
    return {
        data: getOrder(),
        meta: getOrderMeta(),
        errors: {},
        statuses: {},
    };
}

export function getOrderConsignment(): OrderConsignment {
    return {
        shipping: [getOrderShippingConsignment()],
    };
}

export function getOrderShippingConsignment(): OrderShippingConsignment {
    return {
        lineItems: [
            {
                id: 123,
            },
        ],
        shippingAddressId: 1,
        firstName: 'firstName',
        lastName: 'lastName',
        company: 'companyName',
        address1: '2802 Skyway Cir',
        address2: 'Balcony',
        city: 'Austin',
        stateOrProvince: 'Texas',
        postalCode: '78704',
        country: 'United States',
        countryCode: 'US',
        email: 'test@bigcommerce.com',
        phone: '0410123452',
        itemsTotal: 1,
        itemsShipped: 0,
        shippingMethod: 'Flat Rate',
        baseCost: 15.5,
        costExTax: 15.5,
        costIncTax: 16.7,
        costTax: 1.2,
        costTaxClassId: 2,
        baseHandlingCost: 0,
        handlingCostExTax: 0,
        handlingCostIncTax: 0,
        handlingCostTax: 0,
        handlingCostTaxClassId: 2,
        shippingZoneId: 1,
        shippingZoneName: 'United States',
        customFields: [
            {
                name: 'customerMessage',
                value: 'foobar',
            },
        ],
    };
}
