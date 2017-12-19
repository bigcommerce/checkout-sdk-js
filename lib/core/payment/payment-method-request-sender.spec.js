"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var payment_methods_mock_1 = require("./payment-methods.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var payment_method_request_sender_1 = require("./payment-method-request-sender");
describe('PaymentMethodRequestSender', function () {
    var paymentMethodRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(); }),
        };
        paymentMethodRequestSender = new payment_method_request_sender_1.default(requestSender);
    });
    describe('#loadPaymentMethods()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodsResponseBody());
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads payment methods', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = expect;
                        return [4 /*yield*/, paymentMethodRequestSender.loadPaymentMethods()];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', { timeout: undefined });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment methods with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        requestSender.get.mockReturnValue(Promise.resolve(response));
                        _a = expect;
                        return [4 /*yield*/, paymentMethodRequestSender.loadPaymentMethods(options)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#getPaymentMethod()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(payment_methods_mock_1.getPaymentMethodResponseBody());
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads payment method', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestSender.get.mockReturnValue(Promise.resolve(response));
                        _a = expect;
                        return [4 /*yield*/, paymentMethodRequestSender.loadPaymentMethod('braintree')];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', { timeout: undefined });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads payment method with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        requestSender.get.mockReturnValue(Promise.resolve(response));
                        _a = expect;
                        return [4 /*yield*/, paymentMethodRequestSender.loadPaymentMethod('braintree', options)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/payments/braintree', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=payment-method-request-sender.spec.js.map