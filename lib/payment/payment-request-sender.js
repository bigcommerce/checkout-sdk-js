"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PaymentRequestSender = (function () {
    function PaymentRequestSender(client) {
        this._client = client;
    }
    PaymentRequestSender.prototype.submitPayment = function (payload) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.submitPayment(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
    };
    PaymentRequestSender.prototype.initializeOffsitePayment = function (payload) {
        var _this = this;
        return new Promise(function () {
            _this._client.initializeOffsitePayment(payload);
        });
    };
    PaymentRequestSender.prototype._transformResponse = function (response) {
        return {
            headers: {},
            body: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    };
    return PaymentRequestSender;
}());
exports.default = PaymentRequestSender;
//# sourceMappingURL=payment-request-sender.js.map