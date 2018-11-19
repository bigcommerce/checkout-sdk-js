import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CartSelector from './cart-selector';

describe('CartSelector', () => {
    let cartSelector: CartSelector;
    let state: CheckoutStoreState;

    beforeEach(() => {
        state = getCheckoutStoreState();
    });

    describe('#getCart()', () => {
        it('returns the current cart', () => {
            cartSelector = new CartSelector(state.cart);

            expect(cartSelector.getCart()).toEqual(state.cart.data);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            cartSelector = new CartSelector({
                ...state.cart,
                errors: { loadError },
            });

            expect(cartSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            cartSelector = new CartSelector(state.cart);

            expect(cartSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading cart', () => {
            cartSelector = new CartSelector({
                ...state.cart,
                statuses: { isLoading: true },
            });

            expect(cartSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading cart', () => {
            cartSelector = new CartSelector(state.cart);

            expect(cartSelector.isLoading()).toEqual(false);
        });
    });
});
