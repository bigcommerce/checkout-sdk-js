import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';

import Cart from './cart';
import CartState, { DEFAULT_STATE } from './cart-state';

export default interface CartSelector {
    getCart(): Cart | undefined;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type CartSelectorFactory = (state: CartState) => CartSelector;

export function createCartSelectorFactory() {
    const getCart = createSelector(
        (state: CartState) => state.data,
        cart => () => cart
    );

    const getLoadError = createSelector(
        (state: CartState) => state.errors.loadError,
        error => () => error
    );

    const isLoading = createSelector(
        (state: CartState) => !!state.statuses.isLoading,
        status => () => status
    );

    return memoizeOne((
        state: CartState = DEFAULT_STATE
    ): CartSelector => {
        return {
            getCart: getCart(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
