export default class CartSelector {
    /**
     * @constructor
     * @param {CartState} cart
     */
    constructor(cart = {}) {
        this._cart = cart;
    }

    /**
     * @return {Cart}
     */
    getCart() {
        return this._cart.data;
    }

    /**
     * @return {boolean}
     */
    isValid() {
        return !!this._cart.meta.isValid;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._cart.errors && this._cart.errors.loadError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getVerifyError() {
        return this._cart.errors && this._cart.errors.verifyError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._cart.statuses && this._cart.statuses.isLoading);
    }

    /**
     * @return {boolean}
     */
    isVerifying() {
        return !!(this._cart.statuses && this._cart.statuses.isVerifying);
    }
}
