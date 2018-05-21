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

export type OrderPayments = Array<DefaultOrderPayment | GiftCertificateOrderPayment>;

export interface OrderPayment {
    providerId: string;
    gatewayId?: string | null;
    description: string;
    amount: number;
}

export interface DefaultOrderPayment extends OrderPayment {
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
