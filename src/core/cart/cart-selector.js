export default class CartSelector {
    /**
     * @constructor
     * @param {CartState} cart
     */
    constructor(cart = {}) {
        this._cart = cart.data;
        this._cartMeta = cart.meta;
        this._errors = cart.errors;
        this._statuses = cart.statuses;
    }

    /**
     * @return {Cart}
     */
    getCart() {
        return this._cart;
    }

    /**
     * @return {boolean}
     */
    isValid() {
        return !!this._cartMeta.isValid;
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadError() {
        return this._errors && this._errors.loadError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getVerifyError() {
        return this._errors && this._errors.verifyError;
    }

    /**
     * @return {boolean}
     */
    isLoading() {
        return !!(this._statuses && this._statuses.isLoading);
    }

    /**
     * @return {boolean}
     */
    isVerifying() {
        return !!(this._statuses && this._statuses.isVerifying);
    }
}
