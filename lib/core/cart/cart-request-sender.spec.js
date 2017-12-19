"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var carts_mock_1 = require("./carts.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var cart_request_sender_1 = require("./cart-request-sender");
describe('CartRequestSender', function () {
    var cartRequestSender;
    var response;
    var requestSender;
    beforeEach(function () {
        response = responses_mock_1.getResponse(carts_mock_1.getCartResponseBody());
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(response); }),
        };
        cartRequestSender = new cart_request_sender_1.default(requestSender);
    });
    describe('#loadCart()', function () {
        it('sends request to load cart', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cartRequestSender.loadCart()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/cart', { timeout: undefined });
                        return [2 /*return*/];
                }
            });
        }); });
        it('sends request to load cart with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, cartRequestSender.loadCart(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/cart', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=cart-request-sender.spec.js.map