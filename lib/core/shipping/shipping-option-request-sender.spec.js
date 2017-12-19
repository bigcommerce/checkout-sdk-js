"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var shipping_options_mock_1 = require("./shipping-options.mock");
var shipping_option_request_sender_1 = require("./shipping-option-request-sender");
describe('ShippingOptionRequestSender', function () {
    var shippingOptionRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(); }),
            put: jest.fn(function () { return Promise.resolve(); }),
        };
        shippingOptionRequestSender = new shipping_option_request_sender_1.default(requestSender);
    });
    describe('#loadShippingOptions()', function () {
        var response;
        beforeEach(function () {
            response = {
                body: { data: shipping_options_mock_1.getShippingOptions() },
            };
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads shipping options', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingOptionRequestSender.loadShippingOptions()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                            params: {
                                includes: 'cart,quote,shippingOptions',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads shipping options with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, shippingOptionRequestSender.loadShippingOptions(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', tslib_1.__assign({}, options, { params: {
                                includes: 'cart,quote,shippingOptions',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#selectShippingOption()', function () {
        var addressId = '12312';
        var shippingOptionId = 'shippingoptionid123';
        it('selects shipping option', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId)];
                    case 1:
                        _a.sent();
                        expect(requestSender.put).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', {
                            body: {
                                addressId: addressId,
                                shippingOptionId: shippingOptionId,
                            },
                            params: {
                                includes: 'cart,quote,shippingOptions',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('selects shipping option with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId, options)];
                    case 1:
                        _a.sent();
                        expect(requestSender.put).toHaveBeenCalledWith('/internalapi/v1/checkout/shippingoptions', tslib_1.__assign({}, options, { body: {
                                addressId: addressId,
                                shippingOptionId: shippingOptionId,
                            }, params: {
                                includes: 'cart,quote,shippingOptions',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=shipping-option-request-sender.spec.js.map