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

    isValid(): boolean {
        return !!(this._cart.meta && this._cart.meta.isValid);
    }

    getLoadError(): Error | undefined {
        return this._cart.errors.loadError;
    }

    getVerifyError(): Error | undefined {
        return this._cart.errors.verifyError;
    }

    isLoading(): boolean {
        return !!this._cart.statuses.isLoading;
    }

    isVerifying(): boolean {
        return !!this._cart.statuses.isVerifying;
    }
}
