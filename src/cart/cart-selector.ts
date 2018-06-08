import { selector } from '../common/selector';

import CartState from './cart-state';
import InternalCart from './internal-cart';

@selector
export default class CartSelector {
    constructor(
        private _cart: CartState
    ) {}

    getCart(): InternalCart | undefined {
        return this._cart.data;
    }

    getLoadError(): Error | undefined {
        return this._cart.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._cart.statuses.isLoading;
    }
}
