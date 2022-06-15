import { InternalLineItem } from '../cart';
import { InternalCoupon, InternalGiftCertificate } from '../coupon';
import { DiscountNotification } from '../discount';

export default interface InternalOrder {
    id: number;
    orderId: number;
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
    discountNotifications: DiscountNotification[];
    giftCertificate: InternalGiftCertificateList;
    shipping: {
        amount: number;
        integerAmount: number;
        amountBeforeDiscount: number;
        integerAmountBeforeDiscount: number;
    };
    status: string;
    storeCredit: {
        amount: number;
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
    token?: string;
    payment: InternalOrderPayment;
    socialData?: { [itemId: string]: InternalSocialDataList };
    hasDigitalItems: boolean;
    isDownloadable: boolean;
    isComplete: boolean;
    callbackUrl?: string;
}

export interface InternalIncompleteOrder {
    isComplete: false;
    orderId: null;
    payment: InternalOrderPayment;
    status?: string;
    hasDigitalItems?: boolean;
    isDownloadable?: boolean;
}

export interface InternalGiftCertificateList {
    totalDiscountedAmount: number;
    appliedGiftCertificates: { [code: string]: InternalGiftCertificate };
}

export interface InternalOrderPayment {
    id?: string;
    gateway?: string;
    redirectUrl?: string;
    returnUrl?: string;
    status?: string;
    helpText?: string;
}

export interface InternalOrderMeta {
    deviceFingerprint?: string;
}

export interface InternalSocialDataItem {
    name: string;
    description: string;
    image: string;
    url: string;
    shareText: string;
    sharingLink: string;
    channelName: string;
    channelCode: string;
}

export interface InternalSocialDataList {
    [key: string]: InternalSocialDataItem;
}
