import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithApplePayButtonInitializeOptions } from '../apple-pay-button-initialize-options';
import ApplePayButtonMethodType from '../apple-pay-button-method-type';
import LineItemMap from "../../../core/src/cart/line-item-map";

export interface Cart {
    id: string;
    customerId: number;
    currency: Currency;
    email: string;
    isTaxIncluded: boolean;
    baseAmount: number;
    discountAmount: number;
    cartAmount: number;
    coupons: Coupon[];
    discounts: Discount[];
    lineItems: LineItemMap;
    createdTime: string;
    updatedTime: string;
    source?: 'BUY_NOW';
}
export interface PhysicalItem extends LineItem1 {
    isShippingRequired: boolean;
    giftWrapping?: {
        name: string;
        message: string;
        amount: number;
    };
}
export function getPhysicalItem(): PhysicalItem {
    return {
        id: '666',
        variantId: 71,
        productId: 103,
        sku: 'CLC',
        name: 'Canvas Laundry Cart',
        url: '/canvas-laundry-cart/',
        quantity: 1,
        brand: 'OFS',
        isTaxable: true,
        imageUrl: '/images/canvas-laundry-cart.jpg',
        discounts: [],
        discountAmount: 10,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 190,
        comparisonPrice: 200,
        extendedListPrice: 200,
        extendedSalePrice: 190,
        extendedComparisonPrice: 200,
        isShippingRequired: true,
        addedByPromotion: false,
        options: [
            {
                name: 'n',
                nameId: 1,
                value: 'v',
                valueId: 3,
            },
        ],
        categories: [[{ name: 'Cat 1' }], [{ name: 'Furniture' }, { name: 'Bed' }]],
        categoryNames: ['Cat 1'],
    };
}
export interface GiftCertificateItem {
    id: string | number;
    name: string;
    theme: string;
    amount: number;
    taxable: boolean;
    sender: {
        name: string;
        email: string;
    };
    recipient: {
        name: string;
        email: string;
    };
    message: string;
}
export function getGiftCertificateItem(): GiftCertificateItem {
    return {
        id: 'bd391ead-8c58-4105-b00e-d75d233b429a',
        name: '$100 Gift Certificate',
        message: 'message',
        amount: 100,
        taxable: false,
        theme: 'General',
        sender: {
            name: 'pablo',
            email: 'pa@blo.com',
        },
        recipient: {
            name: 'luis',
            email: 'lu@is.com',
        },
    };
}
export interface Discount {
    id: string;
    discountedAmount: number;
}
export function getDiscount(): Discount {
    return {
        id: '12e11c8f-7dce-4da3-9413-b649533f8bad',
        discountedAmount: 10,
    };
}
export function getShippingCoupon(): Coupon {
    return {
        code: '279F507D817E3E7',
        displayName: '$5.00 off the shipping total',
        couponType: 'shipping_discount',
        discountedAmount: 5,
        id: '4',
    };
}
export interface Coupon {
    id: string;
    displayName: string;
    code: string;
    couponType: string;
    discountedAmount: number;
}
export function getCoupon(): Coupon {
    return {
        code: 'savebig2015',
        displayName: '20% off each item',
        couponType: 'percentage_discount',
        discountedAmount: 5,
        id: '1',
    };
}
export interface LineItem1 {
    id: string | number;
    variantId: number;
    productId: number;
    sku: string;
    name: string;
    url: string;
    quantity: number;
    brand: string;
    categoryNames?: string[];
    categories?: LineItemCategory[][];
    isTaxable: boolean;
    imageUrl: string;
    discounts: Array<{ name: string; discountedAmount: number }>;
    discountAmount: number;
    couponAmount: number;
    listPrice: number;
    salePrice: number;
    comparisonPrice: number;
    extendedListPrice: number;
    extendedSalePrice: number;
    extendedComparisonPrice: number;
    socialMedia?: LineItemSocialData[];
    options?: LineItemOption[];
    addedByPromotion: boolean;
    parentId?: string | null;
}

export interface LineItemOption {
    name: string;
    nameId: number;
    value: string;
    valueId: number | null;
}

export interface LineItemSocialData {
    channel: string;
    code: string;
    text: string;
    link: string;
}

export interface LineItemCategory {
    name: string;
}
export interface DigitalItem extends LineItem1 {
    downloadFileUrls: string[];
    downloadPageUrl: string;
    downloadSize: string;
}
export function getDigitalItem(): DigitalItem {
    return {
        id: '667',
        variantId: 72,
        productId: 104,
        sku: 'CLX',
        name: 'Digital Book',
        url: '/digital-book/',
        quantity: 1,
        brand: 'Digitalia',
        isTaxable: true,
        imageUrl: '/images/digital-book.jpg',
        discounts: [],
        discountAmount: 0,
        couponAmount: 0,
        listPrice: 200,
        salePrice: 200,
        comparisonPrice: 200,
        downloadPageUrl: 'url.php',
        downloadFileUrls: [],
        downloadSize: '',
        extendedListPrice: 200,
        extendedSalePrice: 200,
        extendedComparisonPrice: 200,
        addedByPromotion: false,
        options: [
            {
                name: 'm',
                nameId: 1,
                value: 'l',
                valueId: 3,
            },
        ],
        categories: [[{ name: 'Cat 1' }], [{ name: 'Cat 2' }], [{ name: 'Cat 3' }]],
        categoryNames: ['Ebooks', 'Audio Books'],
    };
}
export function getCurrency(): Currency {
    return {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimalPlaces: 2,
    };
}

export interface Currency {
    name: string;
    code: string;
    symbol: string;
    decimalPlaces: number;
}
interface LineItem {
    productId: number;
    quantity: number;
    optionSelections?: {
        optionId: number;
        optionValue: number | string;
    };
}
export default interface BuyNowCartRequestBody {
    source: 'BUY_NOW';
    lineItems: LineItem[];
}

const buyNowCartRequestBody: BuyNowCartRequestBody = {
    source: 'BUY_NOW',
    lineItems: [
        {
            productId: 1,
            quantity: 2,
            optionSelections: {
                optionId: 11,
                optionValue: 11,
            },
        },
    ],
};

export const buyNowCartMock = {
    ...getCart(),
    id: 999,
    source: 'BUY_NOW',
};

export function getCart(): Cart {
    return {
        id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
        customerId: 4,
        currency: getCurrency(),
        email: 'foo@bar.com',
        isTaxIncluded: false,
        baseAmount: 200,
        discountAmount: 10,
        cartAmount: 190,
        coupons: [getCoupon(), getShippingCoupon()],
        discounts: [getDiscount()],
        lineItems: {
            physicalItems: [getPhysicalItem()],
            digitalItems: [getDigitalItem()],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [],
        },
        createdTime: '2018-03-06T04:41:49+00:00',
        updatedTime: '2018-03-07T03:44:51+00:00',
    };
}

export function getApplePayButtonInitializationOptions(): CheckoutButtonInitializeOptions &
    WithApplePayButtonInitializeOptions {
    return {
        containerId: 'applePayCheckoutButton',
        methodId: ApplePayButtonMethodType.APPLEPAY,
        applepay: {
            onPaymentAuthorize: jest.fn(),
            buyNowInitializeOptions: {
                getBuyNowCartRequestBody: jest.fn().mockReturnValue(buyNowCartRequestBody),
            },
        },
    };
}
