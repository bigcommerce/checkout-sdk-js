import { getCart } from './carts.mock';
import CartComparator from './cart-comparator';

describe('CartComparator', () => {
    let comparator;

    beforeEach(() => {
        comparator = new CartComparator();
    });

    describe('#isEqual()', () => {
        it('returns true if two carts are equal', () => {
            const cartA = getCart();
            const cartB = getCart();

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });

        it('returns false if two carts are not equal', () => {
            const cartA = getCart();
            const cartB = { ...getCart(), currency: 'JPY' };

            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });

        it('returns true if two carts are only different in their ignored properties', () => {
            const cartA = getCart();
            const cartB = {
                ...cartA,
                lineItems: {
                    ...cartA.lineItems,
                    physicalItems: cartA.lineItems.physicalItems.map(item => ({
                        ...item,
                        id: `${item.id}123`,
                        imageUrl: `${item.imageUrl}123`,
                    })),
                },
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });
    });
});
