import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCart } from '../carts.mock';

import mapToCart from './map-to-cart';
import { getHeadlessCartResponse } from './mocks/headless-cart.mock';

describe('mapToCart', () => {
    let headlessCartResponse: Cart | undefined;

    beforeEach(() => {
        headlessCartResponse = mapToCart(getHeadlessCartResponse().data.site);
    });

    it('maps to internal cart', () => {
        const cart = getCart();

        // TODO:: data is not yet fully compatible due to lack of information
        expect(headlessCartResponse).toEqual(
            expect.objectContaining({
                id: cart.id,
                isTaxIncluded: cart.isTaxIncluded,
                discountAmount: cart.discountAmount,
                baseAmount: cart.baseAmount,
                cartAmount: cart.cartAmount,
                createdTime: cart.createdTime,
                updatedTime: cart.updatedTime,
                coupons: cart.coupons.map((item) =>
                    expect.objectContaining({
                        id: item.id,
                        code: item.code,
                        couponType: item.couponType,
                        discountedAmount: item.discountedAmount,
                    }),
                ),
                lineItems: expect.objectContaining({
                    physicalItems: cart.lineItems.physicalItems.map((item) =>
                        expect.objectContaining({
                            id: item.id,
                            variantId: item.variantId,
                            productId: item.productId,
                            sku: item.sku,
                            name: item.name,
                            url: item.url,
                            quantity: item.quantity,
                            brand: item.brand,
                            isTaxable: item.isTaxable,
                            imageUrl: item.imageUrl,
                            discounts: item.discounts,
                            discountAmount: item.discountAmount,
                            couponAmount: item.couponAmount,
                            listPrice: item.listPrice,
                            salePrice: item.salePrice,
                            extendedListPrice: item.extendedListPrice,
                            extendedSalePrice: item.extendedSalePrice,
                            isShippingRequired: item.isShippingRequired,
                            options: expect.arrayContaining(item.options || []),
                            // retailPrice, comparisonPrice, extendedComparisonPrice, addedByPromotion are not exist
                        }),
                    ),
                }),
                discounts: cart.discounts,
                currency: cart.currency,
                // customerId is not exist
                // email is not exist
            }),
        );
    });
});
