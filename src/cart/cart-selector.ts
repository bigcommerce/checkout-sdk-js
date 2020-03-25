import { memoizeOne } from '@bigcommerce/memoize';

import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';

import Cart from './cart';
import CartState, { DEFAULT_STATE } from './cart-state';

export default interface CartSelector {
    getCart(): Cart | undefined;
    getCartOrThrow(): Cart;
    getLoadError(): Error | undefined;
    isLoading(): boolean;
}

export type CartSelectorFactory = (state: CartState) => CartSelector;

export function createCartSelectorFactory() {
    const getCart = createSelector(
        (state: CartState) => state.data,
        cart => () => cart
    );

    const getCartOrThrow = createSelector(
        getCart,
        getCart => () => {
          return guard(getCart(), () => new MissingDataError(MissingDataErrorType.MissingCart));
        }
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
            getCartOrThrow: getCartOrThrow(state),
            getLoadError: getLoadError(state),
            isLoading: isLoading(state),
        };
    });
}
