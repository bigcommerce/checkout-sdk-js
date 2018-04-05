import { InternalLineItem } from '../cart';
import { InternalCoupon, InternalGiftCertificate } from '../coupon';

import InternalIncompleteOrder from './internal-incomplete-order';

export default interface InternalOrder extends InternalIncompleteOrder {
    id: number;
    items: InternalLineItem[];
    currency: string;
    customerCanBeCreated: boolean;
    subtotal: {
        amount: number;
        integerAmount: number;
    };
    coupon: {
        discountedAmount: number;
        coupons: InternalCoupon[];
    };
    discount: {
        amount: number;
        integerAmount: number;
    };
    discountNotifications: Array<{
        message: string;
        messageHtml: string;
        type: string;
    }>;
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: InternalGiftCertificate[];
    };
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
        required: boolean;
    };
    storeCredit: {
        amount: number;
    };
    taxSubtotal: {
        amount: number;
        integerAmount: number;
    };
    taxes: Array<{ name: string, amount: number }>;
    taxTotal: {
        amount: number;
        integerAmount: number;
    };
    handling: {
        amount: number;
        integerAmount: number;
    };
    grandTotal: {
        amount: number;
        integerAmount: number;
    };
}
