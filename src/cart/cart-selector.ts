import InternalCart from './internal-cart';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CartSelector {
    constructor(
        private _cart: any = {}
    ) {}

    getCart(): InternalCart | undefined {
        return this._cart.data;
    }

    isValid(): boolean {
        return !!(this._cart.meta && this._cart.meta.isValid);
    }

    getLoadError(): Error | undefined {
        return this._cart.errors && this._cart.errors.loadError;
    }

    getVerifyError(): Error | undefined {
        return this._cart.errors && this._cart.errors.verifyError;
    }

    isLoading(): boolean {
        return !!(this._cart.statuses && this._cart.statuses.isLoading);
    }

    isVerifying(): boolean {
        return !!(this._cart.statuses && this._cart.statuses.isVerifying);
    }
}
