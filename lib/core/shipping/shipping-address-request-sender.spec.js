"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var shipping_address_mock_1 = require("./shipping-address.mock");
var shipping_address_request_sender_1 = require("./shipping-address-request-sender");
describe('ShippingAddressRequestSender', function () {
    var shippingAddressRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            post: jest.fn(function () { return Promise.resolve(); }),
        };
        shippingAddressRequestSender = new shipping_address_request_sender_1.default(requestSender);
    });
    describe('#updateAddress()', function () {
        var response;
        beforeEach(function () {
            response = {
                body: {
                    data: {
                        shippingAddress: shipping_address_mock_1.getShippingAddress(),
                    },
                },
            };
            requestSender.post.mockReturnValue(Promise.resolve(response));
        });
        it('updates shipping address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var address;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = shipping_address_mock_1.getShippingAddress();
                        return [4 /*yield*/, shippingAddressRequestSender.updateAddress(address)];
                    case 1:
                        _a.sent();
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/shipping', {
                            body: shipping_address_mock_1.getShippingAddress(),
                            params: {
                                includes: 'cart,quote,shippingOptions',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('updates shipping address with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var address, options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = shipping_address_mock_1.getShippingAddress();
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, shippingAddressRequestSender.updateAddress(address, options)];
                    case 1:
                        _a.sent();
                        expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/shipping', tslib_1.__assign({}, options, { body: shipping_address_mock_1.getShippingAddress(), params: {
                                includes: 'cart,quote,shippingOptions',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=shipping-address-request-sender.spec.js.map