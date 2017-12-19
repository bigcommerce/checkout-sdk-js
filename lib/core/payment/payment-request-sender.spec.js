"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var payment_request_sender_1 = require("./payment-request-sender");
var payments_mock_1 = require("./payments.mock");
describe('PaymentRequestSender', function () {
    var bigpayClient;
    var paymentRequestSender;
    describe('#submitPayment()', function () {
        beforeEach(function () {
            bigpayClient = {
                submitPayment: jest.fn(function (payload, callback) { return callback(null, {
                    data: payments_mock_1.getPaymentResponseBody(),
                    status: 200,
                    statusText: 'OK',
                }); }),
            };
            paymentRequestSender = new payment_request_sender_1.default(bigpayClient);
        });
        it('submits payment data to Bigpay', function () {
            var payload = {};
            paymentRequestSender.submitPayment(payload);
            expect(bigpayClient.submitPayment).toHaveBeenCalledWith(payload, expect.any(Function));
        });
        it('returns payment response if submission is successful', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, paymentRequestSender.submitPayment(payments_mock_1.getPaymentRequestBody())];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual({
                            body: payments_mock_1.getPaymentResponseBody(),
                            headers: {},
                            status: 200,
                            statusText: 'OK',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns error response if submission is unsuccessful', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bigpayClient.submitPayment = jest.fn(function (payload, callback) { return callback({
                            data: payments_mock_1.getErrorPaymentResponseBody(),
                            status: 400,
                            statusText: 'Bad Request',
                        }); });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, paymentRequestSender.submitPayment(payments_mock_1.getPaymentRequestBody())];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        expect(error_1).toEqual({
                            body: payments_mock_1.getErrorPaymentResponseBody(),
                            headers: {},
                            status: 400,
                            statusText: 'Bad Request',
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#initializeOffsitePayment()', function () {
        beforeEach(function () {
            bigpayClient = {
                initializeOffsitePayment: jest.fn(),
            };
            paymentRequestSender = new payment_request_sender_1.default(bigpayClient);
        });
        it('submits payment data to Bigpay', function () {
            var payload = payments_mock_1.getPaymentRequestBody();
            paymentRequestSender.initializeOffsitePayment(payload);
            expect(bigpayClient.initializeOffsitePayment).toHaveBeenCalledWith(payload);
        });
    });
});
//# sourceMappingURL=payment-request-sender.spec.js.map