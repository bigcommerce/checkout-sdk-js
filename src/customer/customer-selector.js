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
     * @return {?ErrorResponse}
     */
    getSignInError() {
        return this._customer.errors && this._customer.errors.signInError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignOutError() {
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
     * @return {boolean}
     */
    isSigningIn() {
        return !!(this._customer.statuses && this._customer.statuses.isSigningIn);
    }

    /**
     * @return {boolean}
     */
    isSigningOut() {
        return !!(this._customer.statuses && this._customer.statuses.isSigningOut);
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
