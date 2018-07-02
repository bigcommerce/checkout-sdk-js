import { Address } from '../address';
import { LineItemMap } from '../cart';
import { Coupon } from '../coupon';
import { Currency } from '../currency';
import { Tax } from '../tax';

export default interface Order {
    baseAmount: number;
    billingAddress: Address;
    cartId: string;
    coupons: Coupon[];
    currency: Currency;
    customerCanBeCreated: boolean;
    customerId: number;
    customerMessage: string;
    discountAmount: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: LineItemMap;
    orderAmount: number;
    orderAmountAsInteger: number;
    orderId: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    handlingCostTotal: number;
    taxes: Tax[];
    payments?: OrderPayments;
    status: string;
}

export type OrderPayments = Array<GatewayOrderPayment | GiftCertificateOrderPayment>;

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
