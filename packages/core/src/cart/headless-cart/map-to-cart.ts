import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import mapToCartLineItems from './map-to-cart-line-items';

import { HeadlessCartResponse } from './';

export default function mapToCart(headlessCartResponse: HeadlessCartResponse): Cart | undefined {
    const { cart, checkout, currency } = headlessCartResponse;

    if (!cart || !checkout || !currency) {
        return;
    }

    return {
        id: cart.entityId,
        baseAmount: cart.baseAmount.value,
        cartAmount: cart.amount.value,
        discounts: cart.discounts.map((discount) => ({
            id: discount.entityId,
            discountedAmount: discount.discountedAmount.value,
        })),
        isTaxIncluded: cart.isTaxIncluded,
        lineItems: mapToCartLineItems(cart.lineItems),
        currency: {
            code: currency.code,
            name: currency.name,
            symbol: currency.display.symbol,
            decimalPlaces: currency.display.decimalPlaces,
        },
        createdTime: cart.createdAt.utc,
        updatedTime: cart.updatedAt.utc,
        discountAmount: cart.discountedAmount.value,

        coupons: checkout.coupons.map((item) => ({
            id: item.entityId,
            code: item.code,
            couponType: item.couponType,
            discountedAmount: item.discountedAmount.value,
            // Info:: there is no info about displayName field
            displayName: '',
        })),
        // Info:: information about email field can be pulled from Billing Address or Shipping Address (https://developer.bigcommerce.com/docs/storefront/cart-checkout/guide/graphql-storefront#get-checkout)
        email: '',
        // Info:: there is no info about customerId field
        customerId: 0,
    };
}
