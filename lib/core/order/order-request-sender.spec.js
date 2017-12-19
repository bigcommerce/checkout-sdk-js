"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orders_mock_1 = require("./orders.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var http_request_1 = require("../../http-request");
var order_request_sender_1 = require("./order-request-sender");
describe('OrderRequestSender', function () {
    var orderRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(); }),
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        orderRequestSender = new order_request_sender_1.default(requestSender);
    });
    describe('#loadOrder()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads order', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orderRequestSender.loadOrder(295)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', { timeout: undefined });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads order with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, orderRequestSender.loadOrder(295, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#submitOrder()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));
        });
        it('submits order and returns response', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var payload, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { useStoreCredit: false };
                        return [4 /*yield*/, orderRequestSender.submitOrder(payload)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', {
                            body: payload,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('submits order and returns response with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var payload, options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { useStoreCredit: false };
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, orderRequestSender.submitOrder(payload, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order', tslib_1.__assign({}, options, { body: payload }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#finalizeOrder()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));
        });
        it('finalizes order and returns response', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orderRequestSender.finalizeOrder(295)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', { timeout: undefined });
                        return [2 /*return*/];
                }
            });
        }); });
        it('finalizes order and returns response with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, orderRequestSender.finalizeOrder(295, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/order/295', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=order-request-sender.spec.js.map