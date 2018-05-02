import { getCart } from './internal-carts.mock';
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
                items: [
                    {
                        ...cartA.items[0],
                        id: '22e11c8f-7dce-4da3-9413-b649533f8bad',
                        imageUrl: '/images/canvas-laundry-cart-2.jpg',
                    },
                    {
                        ...cartA.items[1],
                        id: '22e11c8f-7dce-4da3-9413-b649533f8bad',
                        imageUrl: '/images/canvas-laundry-cart-2.jpg',
                    },
                ],
            };

            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });
    });
});
