import { InternalCoupon, InternalGiftCertificate } from '../coupon';
import { DiscountNotification } from '../discount';

import InternalLineItem from './internal-line-item';

export default interface InternalCart {
    id: string;
    items: InternalLineItem[];
    currency: string;
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
    discountNotifications: DiscountNotification[];
    giftCertificate: {
        totalDiscountedAmount: number;
        appliedGiftCertificates: { [code: string]: InternalGiftCertificate };
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
    taxes: Array<{ name: string; amount: number }>;
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
