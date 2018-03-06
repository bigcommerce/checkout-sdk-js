"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./customer-action-types");
var CustomerActionCreator = (function () {
    function CustomerActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    CustomerActionCreator.prototype.signInCustomer = function (credentials, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));
            _this._checkoutClient.signInCustomer(credentials, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SIGN_IN_CUSTOMER_FAILED, response));
            });
        });
    };
    CustomerActionCreator.prototype.signOutCustomer = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_CUSTOMER_REQUESTED));
            _this._checkoutClient.signOutCustomer(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SIGN_OUT_CUSTOMER_FAILED, response));
            });
        });
    };
    CustomerActionCreator.prototype.initializeCustomer = function (methodId, initializer) {
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_CUSTOMER_REQUESTED, undefined, { methodId: methodId }));
            initializer()
                .then(function (data) {
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_CUSTOMER_SUCCEEDED, data, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_CUSTOMER_FAILED, response, { methodId: methodId }));
            });
        });
    };
    return CustomerActionCreator;
}());
exports.default = CustomerActionCreator;
//# sourceMappingURL=customer-action-creator.js.map