import { LineItemMap } from '../cart';
import { Coupon } from '../coupon';
import { Currency } from '../currency';
import { OrderBillingAddress } from '../order-billing-address/order-billing-address-state';
import { Tax } from '../tax';

import { OrderMetaState } from './order-state';

export default interface Order {
    baseAmount: number;
    billingAddress: OrderBillingAddress;
    cartId: string;
    coupons: Coupon[];
    consignments: OrderConsignment;
    currency: Currency;
    customerCanBeCreated: boolean;
    customerId: number;
    customerMessage: string;
    discountAmount: number;
    handlingCostTotal: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: LineItemMap;
    orderAmount: number;
    orderAmountAsInteger: number;
    orderId: number;
    payments?: OrderPayments;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
    channelId: number;
    fees: OrderFee[];
}

export interface OrderFee {
    id: number;
    type: string;
    customerDisplayName: string;
    cost: number;
    source: string;
}

export type OrderPayments = Array<GatewayOrderPayment | GiftCertificateOrderPayment>;

export type OrderMeta = OrderMetaState;

export interface OrderPayment {
    providerId: string;
    gatewayId?: string;
    methodId?: string;
    paymentId?: string;
    description: string;
    amount: number;
}

export interface GatewayOrderPayment extends OrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
    mandate?: {
        id: string;
        url?: string;
    };
}

export interface GiftCertificateOrderPayment extends OrderPayment {
    detail: {
        code: string;
        remaining: number;
    };
}

export interface OrderConsignment {
    shipping: OrderShippingConsignment[];
}

export interface OrderShippingConsignment {
    lineItems: Array<{
        id: number;
    }>;
    shippingAddressId: number;
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    postalCode: string;
    country: string;
    countryCode: string;
    email: string;
    phone: string;
    itemsTotal: number;
    itemsShipped: number;
    shippingMethod: string;
    baseCost: number;
    costExTax: number;
    costIncTax: number;
    costTax: number;
    costTaxClassId: number;
    baseHandlingCost: number;
    handlingCostExTax: number;
    handlingCostIncTax: number;
    handlingCostTax: number;
    handlingCostTaxClassId: number;
    shippingZoneId: number;
    shippingZoneName: string;
    customFields: Array<{
        name: string;
        value: string | null;
    }>;
}
