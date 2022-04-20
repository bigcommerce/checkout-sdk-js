import { CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import CartSelector, { createCartSelectorFactory, CartSelectorFactory } from './cart-selector';

describe('CartSelector', () => {
    let cartSelector: CartSelector;
    let createCartSelector: CartSelectorFactory;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createCartSelector = createCartSelectorFactory();
        state = getCheckoutStoreState();
    });

    describe('#getCart()', () => {
        it('returns the current cart', () => {
            cartSelector = createCartSelector(state.cart);

            expect(cartSelector.getCart()).toEqual(state.cart.data);
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = new Error();

            cartSelector = createCartSelector({
                ...state.cart,
                errors: { loadError },
            });

            expect(cartSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load', () => {
            cartSelector = createCartSelector(state.cart);

            expect(cartSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading cart', () => {
            cartSelector = createCartSelector({
                ...state.cart,
                statuses: { isLoading: true },
            });

            expect(cartSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading cart', () => {
            cartSelector = createCartSelector(state.cart);

            expect(cartSelector.isLoading()).toEqual(false);
        });
    });
});
