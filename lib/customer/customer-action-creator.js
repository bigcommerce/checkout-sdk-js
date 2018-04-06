"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./customer-action-types");
var CustomerActionCreator = (function () {
    function CustomerActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    CustomerActionCreator.prototype.signInCustomer = function (credentials, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SIGN_IN_CUSTOMER_REQUESTED));
            _this._checkoutClient.signInCustomer(credentials, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.SIGN_IN_CUSTOMER_SUCCEEDED, body.data));
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
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_CUSTOMER_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SIGN_OUT_CUSTOMER_FAILED, response));
            });
        });
    };
    return CustomerActionCreator;
}());
exports.default = CustomerActionCreator;
//# sourceMappingURL=customer-action-creator.js.map