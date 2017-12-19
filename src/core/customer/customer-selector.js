export default class CustomerSelector {
    /**
     * @constructor
     * @param {CustomerState} customer
     */
    constructor(customer = {}) {
        this._customer = customer.data;
        this._errors = customer.errors;
        this._statuses = customer.statuses;
    }

    /**
     * @return {Customer}
     */
    getCustomer() {
        return this._customer;
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignInError() {
        return this._errors && this._errors.signInError;
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignOutError() {
        return this._errors && this._errors.signOutError;
    }

    /**
     * @return {boolean}
     */
    isSigningIn() {
        return !!(this._statuses && this._statuses.isSigningIn);
    }

    /**
     * @return {boolean}
     */
    isSigningOut() {
        return !!(this._statuses && this._statuses.isSigningOut);
    }
}
