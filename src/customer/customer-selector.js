export default class CustomerSelector {
    /**
     * @constructor
     * @param {CustomerState} customer
     */
    constructor(customer = {}) {
        this._customer = customer;
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
        if (methodId && this._customer.errors.signInMethod !== methodId) {
            return;
        }

        return this._customer.errors && this._customer.errors.signInError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getSignOutError(methodId) {
        if (methodId && this._customer.errors.signOutMethod !== methodId) {
            return;
        }

        return this._customer.errors && this._customer.errors.signOutError;
    }

    /**
     * @param {?string} methodId
     * @return {?ErrorResponse}
     */
    getInitializeError(methodId) {
        if (methodId && this._customer.errors.initializeMethod !== methodId) {
            return;
        }

        return this._customer.errors.initializeError;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningIn(methodId) {
        if (methodId && this._customer.statuses.signingInMethod !== methodId) {
            return false;
        }

        return !!this._customer.statuses.isSigningIn;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isSigningOut(methodId) {
        if (methodId && this._customer.statuses.signingOutMethod !== methodId) {
            return false;
        }

        return !!this._customer.statuses.isSigningOut;
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializing(methodId) {
        if (methodId && this._customer.statuses.initializingMethod !== methodId) {
            return false;
        }

        return !!this._customer.statuses.isInitializing;
    }
}
