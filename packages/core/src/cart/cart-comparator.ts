import { isEqual } from 'lodash';

import { PartialDeep } from '../common/types';

import Cart from './cart';

export default class CartComparator {
    isEqual(cartA: Cart, cartB: Cart): boolean {
        return isEqual(
            this._normalize(cartA),
            this._normalize(cartB)
        );
    }

    private _normalize(cart: Cart): PartialDeep<Cart> {
        return {
            cartAmount: cart.cartAmount,
            currency: cart.currency,
            id: cart.id,
            lineItems: {
                digitalItems: cart.lineItems.digitalItems
                    .slice()
                    .sort((itemA, itemB) =>
                        `${itemA.productId}${itemA.variantId}`.localeCompare(`${itemB.productId}${itemB.variantId}`)
                    )
                    .map(item => ({
                        extendedSalePrice: item.extendedSalePrice,
                        productId: item.productId,
                        quantity: item.quantity,
                        variantId: item.variantId,
                    })),
                giftCertificates: cart.lineItems.giftCertificates
                    .slice()
                    .sort((itemA, itemB) => `${itemA.id}`.localeCompare(`${itemB.id}`))
                    .map(item => ({
                        amount: item.amount,
                        recipient: item.recipient,
                    })),
                physicalItems: cart.lineItems.physicalItems
                    .slice()
                    .sort((itemA, itemB) =>
                        `${itemA.productId}${itemA.variantId}`.localeCompare(`${itemB.productId}${itemB.variantId}`)
                    )
                    .map(item => ({
                        extendedSalePrice: item.extendedSalePrice,
                        productId: item.productId,
                        quantity: item.quantity,
                        variantId: item.variantId,
                        giftWrapping: item.giftWrapping,
                    })),
            },
        };
    }
}
