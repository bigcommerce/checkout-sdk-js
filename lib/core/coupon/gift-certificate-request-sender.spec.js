"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var gift_certificate_request_sender_1 = require("./gift-certificate-request-sender");
var responses_mock_1 = require("../../http-request/responses.mock");
var gift_certificate_mock_1 = require("./gift-certificate.mock");
var http_request_1 = require("../../http-request");
describe('Gift Certificate Request Sender', function () {
    var giftCertificateRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            delete: jest.fn(function () { return Promise.resolve(); }),
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        giftCertificateRequestSender = new gift_certificate_request_sender_1.default(requestSender);
    });
    it('giftCertificateRequestSender is defined', function () {
        expect(giftCertificateRequestSender).toBeDefined();
    });
    describe('#applyGiftCertificate()', function () {
        it('applies gift certificate code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody());
                        requestSender.post.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myGiftCertificateCode1234';
                        return [4 /*yield*/, giftCertificateRequestSender.applyGiftCertificate(couponCode)];
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
        it('applies gift certificate with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        response = responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody());
                        requestSender.post.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myGiftCertificateCode1234';
                        return [4 /*yield*/, giftCertificateRequestSender.applyGiftCertificate(couponCode, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', tslib_1.__assign({}, options, { body: { couponCode: couponCode } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#removeGiftCertificate()', function () {
        it('removes gift certificate code', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody());
                        requestSender.delete.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myGiftCertificate1234';
                        return [4 /*yield*/, giftCertificateRequestSender.removeGiftCertificate(couponCode)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myGiftCertificate1234', {});
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes gift certificate code with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, response, couponCode, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        response = responses_mock_1.getResponse(gift_certificate_mock_1.getGiftCertificateResponseBody());
                        requestSender.delete.mockReturnValue(Promise.resolve(response));
                        couponCode = 'myGiftCertificate1234';
                        return [4 /*yield*/, giftCertificateRequestSender.removeGiftCertificate(couponCode, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myGiftCertificate1234', tslib_1.__assign({}, options));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=gift-certificate-request-sender.spec.js.map