import { BillingAddress } from '../billing';
import { LineItemMap } from '../cart';
import { Coupon } from '../coupon';
import { Currency } from '../currency';
import { Tax } from '../tax';

export default interface RawOrder {
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
    payments?: RawOrderPayments;
    giftWrappingCostTotal: number;
    shippingCostTotal: number;
    shippingCostBeforeDiscount: number;
    status: string;
    taxes: Tax[];
    taxTotal: number;
    mandateUrl?: string;
}

export type RawOrderPayment = GatewayOrderPayment | GiftCertificateOrderPayment;

type RawOrderPayments = RawOrderPayment[];

interface BaseOrderPayment {
    providerId: string;
    gatewayId?: string;
    paymentId?: string;
    description: string;
    amount: number;
}

interface GatewayOrderPayment extends BaseOrderPayment {
    detail: {
        step: string;
        instructions: string;
    };
}

interface GiftCertificateOrderPayment extends BaseOrderPayment {
    detail: {
        code: string;
        remaining: number;
    };
}
