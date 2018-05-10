import { Address } from '../address';
import { DigitalItem, GiftCertificateItem, PhysicalItem } from '../cart';
import { Coupon } from '../coupon';
import { Currency } from '../currency';

export default interface Order {
    baseAmount: number;
    billingAddress: Address;
    cartId: string;
    coupons: Coupon[];
    currency: Currency;
    customerCreated: boolean;
    customerId: number;
    discountAmount: number;
    hasDigitalItems: boolean;
    isComplete: boolean;
    isDownloadable: boolean;
    isTaxIncluded: boolean;
    lineItems: {
        physicalItems: PhysicalItem[];
        digitalItems: DigitalItem[];
        giftCertificates: GiftCertificateItem[];
    };
    orderAmount: number;
    orderId: number;
    payments: OrderPayments;
    status: string;
}

export type OrderPayments = Array<DefaultOrderPayment | GiftCertificateOrderPayment>;

export interface OrderPayment {
    providerId: string;
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
