"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./remote-checkout-action-types");
var RemoteCheckoutActionCreator = (function () {
    function RemoteCheckoutActionCreator(remoteCheckoutRequestSender) {
        this._remoteCheckoutRequestSender = remoteCheckoutRequestSender;
    }
    RemoteCheckoutActionCreator.prototype.initializeBilling = function (methodName, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED));
            _this._remoteCheckoutRequestSender.initializeBilling(methodName, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_BILLING_FAILED, response));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.initializeShipping = function (methodName, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED));
            _this._remoteCheckoutRequestSender.initializeShipping(methodName, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, response));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.initializePayment = function (methodName, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED));
            _this._remoteCheckoutRequestSender.initializePayment(methodName, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED, response));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.signOut = function (methodName, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED));
            _this._remoteCheckoutRequestSender.signOut(methodName, options)
                .then(function () {
                observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED, response));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.setCheckoutMeta = function (methodName, meta) {
        return data_store_1.createAction(actionTypes.SET_REMOTE_CHECKOUT_META, (_a = {},
            _a[methodName] = meta,
            _a));
        var _a;
    };
    return RemoteCheckoutActionCreator;
}());
exports.default = RemoteCheckoutActionCreator;
//# sourceMappingURL=remote-checkout-action-creator.js.map