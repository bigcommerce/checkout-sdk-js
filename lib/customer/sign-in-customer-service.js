"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignInCustomerService = (function () {
    function SignInCustomerService(_store, _customerActionCreator, _remoteCheckoutActionCreator) {
        this._store = _store;
        this._customerActionCreator = _customerActionCreator;
        this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
    }
    SignInCustomerService.prototype.signIn = function (credentials, options) {
        return this._store.dispatch(this._customerActionCreator.signInCustomer(credentials, options));
    };
    SignInCustomerService.prototype.signOut = function (options) {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    };
    SignInCustomerService.prototype.remoteSignOut = function (methodName, options) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.signOut(methodName, options));
    };
    SignInCustomerService.prototype.initializeCustomer = function (methodId, initializer) {
        return this._store.dispatch(this._customerActionCreator.initializeCustomer(methodId, initializer));
    };
    return SignInCustomerService;
}());
exports.default = SignInCustomerService;
//# sourceMappingURL=sign-in-customer-service.js.map