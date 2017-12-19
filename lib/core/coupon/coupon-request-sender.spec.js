"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coupon_request_sender_1 = require("./coupon-request-sender");
var http_request_1 = require("../../http-request");
var coupon_mock_1 = require("./coupon.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
describe('Coupon Request Sender', function () {
    var couponRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            delete: jest.fn(function () { return Promise.resolve(); }),
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        couponRequestSender = new coupon_request_sender_1.default(requestSender);
    });
    it('couponRequestSender is defined', function () {
        expect(couponRequestSender).toBeDefined();
    });
    describe('#applyCoupon()', function () {
        it('applies coupon code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody());
                        requestSender.post.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myCouponCode1234';
                        return [4 /*yield*/, couponRequestSender.applyCoupon(couponCode)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', {
                            body: { couponCode: couponCode },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('applies coupon with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        response = responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody());
                        requestSender.post.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myCouponCode1234';
                        return [4 /*yield*/, couponRequestSender.applyCoupon(couponCode, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', tslib_1.__assign({}, options, { body: { couponCode: couponCode } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeCoupon()', function () {
        it('removes coupon code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody());
                        requestSender.delete.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myCouponCode1234';
                        return [4 /*yield*/, couponRequestSender.removeCoupon(couponCode)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myCouponCode1234', {});
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes coupon code with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        response = responses_mock_1.getResponse(coupon_mock_1.getCouponResponseBody());
                        requestSender.delete.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myCouponCode1234';
                        return [4 /*yield*/, couponRequestSender.removeCoupon(couponCode, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myCouponCode1234', options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=coupon-request-sender.spec.js.map