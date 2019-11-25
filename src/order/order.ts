import { BillingAddress } from '../billing';
import { LineItemMap } from '../cart';
import { Coupon } from '../coupon';
import { Currency } from '../currency';
import { Tax } from '../tax';

import { OrderMetaState } from './order-state';

export default interface Order {
    baseAmount: number;
    billingAddress: BillingAddress;
    cartId: string;
    coupons: Coupon[];
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
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
}

export type OrderPayments = Array<GatewayOrderPayment | GiftCertificateOrderPayment>;

export type OrderMeta = OrderMetaState;

export interface OrderPayment {
    providerId: string;
    gatewayId?: string;
    description: string;
    amount: number;
}

export interface GatewayOrderPayment extends OrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
}

export interface GiftCertificateOrderPayment extends OrderPayment {
    detail: {
        code: string;
        remaining: number;
    };
}
