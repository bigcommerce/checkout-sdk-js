export default class CustomerSelector {
    /**
     * @constructor
     * @param {CustomerState} customer
     */
    constructor(customer = {}) {
        this._customer = customer;
    }

    /**
     * @return {Customer}
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
}
