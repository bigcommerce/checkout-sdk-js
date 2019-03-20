import CartComparator from './cart-comparator';
import { getCart } from './carts.mock';

describe('CartComparator', () => {
    let comparator: CartComparator;

    beforeEach(() => {
        comparator = new CartComparator();
    });

    describe('#isEqual()', () => {
        it('returns true if two carts are equal', () => {
            const cartA = getCart();
            const cartB = getCart();

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });

        it('returns true if two carts have different ignored properties', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.map(item => ({
                        ...item,
                        discounts: [
                            { discountedAmount: 0, name: 'foobar' },
                        ],
                        id: `${item.id}-123`,
                    })),
                },
                updatedTime: `${cartA.updatedTime}-123`,
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });

        it('returns false if two carts have different id', () => {
            const cartA = getCart();
            const cartB = { ...cartA, id: `${cartA.id}-123` };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different currency settings', () => {
            const cartA = getCart();
            const cartB = { ...cartA, currency: { ...cartA.currency, code: 'JPY' } };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different total amount', () => {
            const cartA = getCart();
            const cartB = { ...cartA, cartAmount: cartA.cartAmount + 100 };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different line items', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.map(item => ({
                        ...item,
                        productId: item.productId + 1,
                        variantId: item.variantId + 1,
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different line item amount', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.map(item => ({
                        ...item,
                        extendedSalePrice: item.extendedSalePrice * 2,
                        quantity: item.quantity * 2,
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different gift certificate amount', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    giftCertificates: cartA.lineItems.giftCertificates.map(item => ({
                        ...item,
                        amount: item.amount * 2,
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different gift certificate recipient', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    giftCertificates: cartA.lineItems.giftCertificates.map(item => ({
                        ...item,
                        recipient: {
                            ...item.recipient,
                            name: `${item.recipient.name}-123`,
                        },
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns false if two carts have different gift wrapping amount', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.map(item => ({
                        ...item,
                        giftWrapping: {
                            amount: 100,
                            name: 'Foobar',
                            message: 'Foobar',
                        },
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns true if two carts have same items but only differ in their order', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.slice().reverse(),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });
    });
});
