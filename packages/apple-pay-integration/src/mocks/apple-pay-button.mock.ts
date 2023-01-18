import { CheckoutButtonInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithApplePayButtonInitializeOptions } from '../apple-pay-button-initialize-options';
import ApplePayButtonMethodType from '../apple-pay-button-method-type';
import BuyNowCartRequestBody from "../../../core/src/cart/buy-now-cart-request-body";
import {Cart} from "@bigcommerce/checkout-sdk/core";
import {getCurrency} from "../../../core/src/currency/currencies.mock";
import {getCoupon, getShippingCoupon} from "../../../core/src/coupon/coupons.mock";
import {getDiscount} from "../../../core/src/discount/discounts.mock";
import {getDigitalItem, getGiftCertificateItem, getPhysicalItem} from "../../../core/src/cart/line-items.mock";

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
