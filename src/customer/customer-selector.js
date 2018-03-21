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
        if (methodId && this._customerStrategy.errors.signInMethod !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signInError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getSignOutError(methodId) {
        if (methodId && this._customerStrategy.errors.signOutMethod !== methodId) {
            return;
        }

        return this._customerStrategy.errors.signOutError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getInitializeError(methodId) {
        if (methodId && this._customerStrategy.errors.initializeMethod !== methodId) {
            return;
        }

        return this._customerStrategy.errors.initializeError;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningIn(methodId) {
        if (methodId && this._customerStrategy.statuses.signingInMethod !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningIn;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningOut(methodId) {
        if (methodId && this._customerStrategy.statuses.signingOutMethod !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isSigningOut;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializing(methodId) {
        if (methodId && this._customerStrategy.statuses.initializingMethod !== methodId) {
            return false;
        }

        return !!this._customerStrategy.statuses.isInitializing;
    }
}
