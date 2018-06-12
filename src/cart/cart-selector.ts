import { selector } from '../common/selector';

import Cart from './cart';
import CartState from './cart-state';

@selector
export default class CartSelector {
    constructor(
        private _cart: CartState
    ) {}

    getCart(): Cart | undefined {
        return this._cart.data;
    }

    getLoadError(): Error | undefined {
        return this._cart.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._cart.statuses.isLoading;
    }
}
