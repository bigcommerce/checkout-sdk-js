"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utility_1 = require("../../../common/utility");
var errors_1 = require("../../errors");
var BraintreePaymentProcessor = (function () {
    function BraintreePaymentProcessor(_braintreeSDKCreator) {
        this._braintreeSDKCreator = _braintreeSDKCreator;
    }
    BraintreePaymentProcessor.prototype.initialize = function (clientToken, options) {
        this._braintreeSDKCreator.initialize(clientToken);
        this._modalHandler = options.modalHandler;
    };
    BraintreePaymentProcessor.prototype.tokenizeCard = function (payment, billingAddress) {
        var paymentData = payment.paymentData;
        var requestData = this._mapToCreditCard(paymentData, billingAddress);
        return this._braintreeSDKCreator.getClient()
            .then(function (client) { return client.request(requestData); })
            .then(function (_a) {
            var creditCards = _a.creditCards;
            return ({
                nonce: creditCards[0].nonce,
            });
        });
    };
    BraintreePaymentProcessor.prototype.verifyCard = function (payment, billingAddress, amount) {
        if (!this._modalHandler) {
            throw new errors_1.PaymentMethodUninitializedError('A modal handler is required for 3ds payments');
        }
        var _a = this._modalHandler, onRemoveFrame = _a.onRemoveFrame, modalHandler = tslib_1.__rest(_a, ["onRemoveFrame"]);
        return Promise.all([
            this.tokenizeCard(payment, billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]).then(function (_a) {
            var paymentData = _a[0], threeDSecure = _a[1];
            var nonce = paymentData.nonce;
            var verification = threeDSecure.verifyCard(tslib_1.__assign({}, modalHandler, { amount: amount,
                nonce: nonce }));
            var _b = new utility_1.CancellablePromise(verification), promise = _b.promise, cancel = _b.cancel;
            onRemoveFrame(function () {
                threeDSecure.cancelVerifyCard()
                    .then(function () { return cancel(new errors_1.PaymentMethodCancelledError()); });
            });
            return promise;
        });
    };
    BraintreePaymentProcessor.prototype.appendSessionId = function (processedPayment) {
        var _this = this;
        return processedPayment
            .then(function (paymentData) { return Promise.all([paymentData, _this._braintreeSDKCreator.getDataCollector()]); })
            .then(function (_a) {
            var paymentData = _a[0], deviceData = _a[1].deviceData;
            return (tslib_1.__assign({}, paymentData, { deviceSessionId: deviceData }));
        });
    };
    BraintreePaymentProcessor.prototype.deinitialize = function () {
        return this._braintreeSDKCreator.teardown();
    };
    BraintreePaymentProcessor.prototype._mapToCreditCard = function (creditCard, billingAddress) {
        var streetAddress = billingAddress.addressLine1;
        if (billingAddress.addressLine2) {
            streetAddress = " " + billingAddress.addressLine2;
        }
        return {
            data: {
                creditCard: {
                    cardholderName: creditCard.ccName,
                    number: creditCard.ccNumber,
                    cvv: creditCard.ccCvv,
                    expirationDate: creditCard.ccExpiry.month + "/" + creditCard.ccExpiry.year,
                    options: {
                        validate: false,
                    },
                    billingAddress: {
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postCode,
                        streetAddress: streetAddress,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    };
    return BraintreePaymentProcessor;
}());
exports.default = BraintreePaymentProcessor;
//# sourceMappingURL=braintree-payment-processor.js.map