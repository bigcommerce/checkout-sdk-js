"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./payment-action-types");
var PaymentActionCreator = (function () {
    function PaymentActionCreator(paymentRequestSender) {
        this._paymentRequestSender = paymentRequestSender;
    }
    PaymentActionCreator.prototype.submitPayment = function (payment) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SUBMIT_PAYMENT_REQUESTED));
            return _this._paymentRequestSender.submitPayment(payment)
                .then(function (_a) {
                var body = (_a === void 0 ? {} : _a).body;
                observer.next(data_store_1.createAction(actionTypes.SUBMIT_PAYMENT_SUCCEEDED, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SUBMIT_PAYMENT_FAILED, response));
            });
        });
    };
    PaymentActionCreator.prototype.initializeOffsitePayment = function (payment) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_REQUESTED));
            return _this._paymentRequestSender.initializeOffsitePayment(payment)
                .then(function () {
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED));
                observer.complete();
            })
                .catch(function () {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_OFFSITE_PAYMENT_FAILED));
            });
        });
    };
    return PaymentActionCreator;
}());
exports.default = PaymentActionCreator;
//# sourceMappingURL=payment-action-creator.js.map