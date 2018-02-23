"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./payment-method-action-types");
var PaymentMethodActionCreator = (function () {
    function PaymentMethodActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    PaymentMethodActionCreator.prototype.loadPaymentMethods = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHODS_REQUESTED));
            _this._checkoutClient.loadPaymentMethods(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_PAYMENT_METHODS_FAILED, response));
            });
        });
    };
    PaymentMethodActionCreator.prototype.loadPaymentMethod = function (methodId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, undefined, { methodId: methodId }));
            _this._checkoutClient.loadPaymentMethod(methodId, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, data, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_PAYMENT_METHOD_FAILED, response, { methodId: methodId }));
            });
        });
    };
    PaymentMethodActionCreator.prototype.initializePaymentMethod = function (methodId, initializer) {
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_PAYMENT_METHOD_REQUESTED, undefined, { methodId: methodId }));
            initializer()
                .then(function (data) {
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_PAYMENT_METHOD_SUCCEEDED, data, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_PAYMENT_METHOD_FAILED, response, { methodId: methodId }));
            });
        });
    };
    return PaymentMethodActionCreator;
}());
exports.default = PaymentMethodActionCreator;
//# sourceMappingURL=payment-method-action-creator.js.map