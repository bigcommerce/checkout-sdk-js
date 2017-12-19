"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var billing_address_mock_1 = require("./billing-address.mock");
var billing_address_request_sender_1 = require("./billing-address-request-sender");
describe('BillingAddressRequestSender', function () {
    var addressRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        addressRequestSender = new billing_address_request_sender_1.default(requestSender);
    });
    describe('#updateAddress()', function () {
        var response;
        beforeEach(function () {
            response = {
                body: {
                    data: {
                        billingAddress: billing_address_mock_1.getBillingAddress(),
                    },
                },
            };
            requestSender.post.mockReturnValue(Promise.resolve(response));
        });
        it('updates billing address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, addressRequestSender.updateAddress(billing_address_mock_1.getBillingAddress())];
                    case 1:
                        _a.sent();
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/billing', {
                            body: billing_address_mock_1.getBillingAddress(),
                            params: {
                                includes: 'cart,quote',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates billing address with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, addressRequestSender.updateAddress(billing_address_mock_1.getBillingAddress(), options)];
                    case 1:
                        _a.sent();
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/billing', tslib_1.__assign({}, options, { body: billing_address_mock_1.getBillingAddress(), params: {
                                includes: 'cart,quote',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=billing-address-request-sender.spec.js.map