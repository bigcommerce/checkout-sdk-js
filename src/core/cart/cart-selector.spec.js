import { getCart } from './carts.mock';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import CartSelector from './cart-selector';

describe('CartSelector', () => {
    let cartSelector;
    let state;

    beforeEach(() => {
        state = {
            cart: {
                meta: {},
                data: getCart(),
            },
        };
    });

    describe('#getCart()', () => {
        it('returns the current cart', () => {
            cartSelector = new CartSelector(state.cart);

            expect(cartSelector.getCart()).toEqual(state.cart.data);
        });
    });

    describe('#getVerifyError()', () => {
        it('returns error if unable to verify', () => {
            const verifyError = getErrorResponseBody();

            cartSelector = new CartSelector({
                ...state.cart,
                errors: { verifyError },
            });

            expect(cartSelector.getVerifyError()).toEqual(verifyError);
        });

        it('does not returns error if able to load', () => {
            cartSelector = new CartSelector(state.verify);

            expect(cartSelector.getVerifyError()).toBeUndefined();
        });
    });

    describe('#getLoadError()', () => {
        it('returns error if unable to load', () => {
            const loadError = getErrorResponseBody();

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

    describe('#isVerifying()', () => {
        it('returns true if loading cart', () => {
            cartSelector = new CartSelector({
                ...state.cart,
                statuses: { isVerifying: true },
            });

            expect(cartSelector.isVerifying()).toEqual(true);
        });

        it('returns false if not loading cart', () => {
            cartSelector = new CartSelector(state.cart);

            expect(cartSelector.isVerifying()).toEqual(false);
        });
    });
});
