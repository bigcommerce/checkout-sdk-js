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
                digitalItems: cart.lineItems.digitalItems.map(item => ({
                    extendedSalePrice: item.extendedSalePrice,
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variantId,
                })),
                giftCertificates: cart.lineItems.giftCertificates.map(item => ({
                    amount: item.amount,
                    recipient: item.recipient,
                })),
                physicalItems: cart.lineItems.physicalItems.map(item => ({
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
