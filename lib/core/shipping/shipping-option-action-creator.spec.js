"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var http_request_1 = require("../../http-request");
var actionTypes = require("./shipping-option-action-types");
var shipping_option_action_creator_1 = require("./shipping-option-action-creator");
describe('ShippingOptionActionCreator', function () {
    var checkoutClient;
    var shippingOptionActionCreator;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse({ data: shipping_options_mock_1.getShippingOptions() });
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            loadShippingOptions: jest.fn(function () { return Promise.resolve(response); }),
            selectShippingOption: jest.fn(function () { return Promise.resolve(response); }),
        };
        shippingOptionActionCreator = new shipping_option_action_creator_1.default(checkoutClient);
    });
    describe('#loadShippingOptions()', function () {
        it('emits actions if able to load shipping options', function () {
            shippingOptionActionCreator.loadShippingOptions()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED },
                    { type: actionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load shipping options', function () {
            checkoutClient.loadShippingOptions.mockImplementation(function () { return Promise.reject(errorResponse); });
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            shippingOptionActionCreator.loadShippingOptions()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED },
                    { type: actionTypes.LOAD_SHIPPING_OPTIONS_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
        it('loads shipping options', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingOptionActionCreator.loadShippingOptions().toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadShippingOptions).toHaveBeenCalledWith(undefined);
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads shipping options with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, shippingOptionActionCreator.loadShippingOptions(options).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadShippingOptions).toHaveBeenCalledWith(options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#selectShippingOption()', function () {
        var addressId;
        var shippingOptionId;
        var options;
        beforeEach(function () {
            addressId = 'address-id-12';
            shippingOptionId = 'shipping-option-id-33';
            options = { timeout: http_request_1.createTimeout() };
        });
        it('emits actions if able to select shipping option', function () {
            shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.SELECT_SHIPPING_OPTION_REQUESTED },
                    { type: actionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to select shipping option', function () {
            checkoutClient.selectShippingOption.mockImplementation(function () { return Promise.reject(errorResponse); });
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            shippingOptionActionCreator.selectShippingOption()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.SELECT_SHIPPING_OPTION_REQUESTED },
                    { type: actionTypes.SELECT_SHIPPING_OPTION_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
        it('sends request to select shipping option', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.selectShippingOption)
                            .toHaveBeenCalledWith(addressId, shippingOptionId, options);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=shipping-option-action-creator.spec.js.map