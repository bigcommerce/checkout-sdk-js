"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var customers_mock_1 = require("./customers.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var customer_request_sender_1 = require("./customer-request-sender");
describe('CustomerRequestSender', function () {
    var customerRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            delete: jest.fn(function () { return Promise.resolve(); }),
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        customerRequestSender = new customer_request_sender_1.default(requestSender);
    });
    describe('#signInCustomer()', function () {
        var credentials;
        var response;
        beforeEach(function () {
            credentials = { email: 'foo@bar.com', password: 'foobar' };
            response = responses_mock_1.getResponse(customers_mock_1.getCustomerResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));
        });
        it('posts customer credentials', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customerRequestSender.signInCustomer(credentials)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                            body: credentials,
                            params: {
                                includes: 'cart,quote,shippingOptions',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('posts customer credentials with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, customerRequestSender.signInCustomer(credentials, options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', tslib_1.__assign({}, options, { body: credentials, params: {
                                includes: 'cart,quote,shippingOptions',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#signOutCustomer()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(customers_mock_1.getCustomerResponseBody());
            requestSender.delete.mockReturnValue(Promise.resolve(response));
        });
        it('signs out customer', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customerRequestSender.signOutCustomer()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', {
                            params: {
                                includes: 'cart,quote,shippingOptions',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('signs out customer with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, customerRequestSender.signOutCustomer(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/customer', tslib_1.__assign({}, options, { params: {
                                includes: 'cart,quote,shippingOptions',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=customer-request-sender.spec.js.map