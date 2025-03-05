import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import mapToCartLineItems from './map-to-cart-line-items';

import { HeadlessCartResponse } from './';

export default function mapToCart(headlessCartResponse: HeadlessCartResponse): Cart | undefined {
    const { cart, checkout } = headlessCartResponse;

    if (!cart || !checkout) {
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
            code: cart.currencyCode,
            // TODO:: we do not have any information regarding to fields below (name, symbol, decimalPlaces) in the GraphQL Storefront doc (https://developer.bigcommerce.com/docs/storefront/cart-checkout/guide/graphql-storefront)
            name: '',
            symbol: '',
            decimalPlaces: 2,
        },
        createdTime: cart.createdAt.utc,
        updatedTime: cart.updatedAt.utc,
        discountAmount: cart.discountedAmount.value,

        coupons: checkout.coupons.map((item) => ({
            id: item.entityId,
            code: item.code,
            couponType: item.couponType,
            discountedAmount: item.discountedAmount.value,
            // TODO:: there is no info about displayName field
            displayName: '',
        })),
        // TODO:: information about email field can be pulled from Billing Address or Shipping Address (https://developer.bigcommerce.com/docs/storefront/cart-checkout/guide/graphql-storefront#get-checkout)
        email: '',
        // TODO:: there is no info about customerId field
        customerId: 0,
    };
}
