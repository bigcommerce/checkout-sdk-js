export default class CustomerSelector {
    /**
     * @constructor
     * @param {CustomerState} customer
     * @param {CustomerStrategyState} customerStrategy
     */
    constructor(customer = {}, customerStrategy = {}) {
        this._customer = customer;
        this._customerStrategy = customerStrategy;
    }

    /**
     * @return {InternalCustomer}
     */
    getCustomer() {
        return this._customer.data;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getSignInError(methodId) {
        if (methodId && this._customerStrategy.errors.signInMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signInError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getSignOutError(methodId) {
        if (methodId && this._customerStrategy.errors.signOutMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signOutError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getInitializeError(methodId) {
        if (methodId && this._customerStrategy.errors.initializeMethodId !== methodId) {
            return;
        }

        return this._customerStrategy.errors.initializeError;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningIn(methodId) {
        if (methodId && this._customerStrategy.statuses.signInMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningIn;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningOut(methodId) {
        if (methodId && this._customerStrategy.statuses.signOutMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningOut;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializing(methodId) {
        if (methodId && this._customerStrategy.statuses.initializeMethodId !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isInitializing;
    }
}
