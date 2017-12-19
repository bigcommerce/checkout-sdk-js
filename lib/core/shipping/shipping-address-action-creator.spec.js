"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var responses_mock_1 = require("../../http-request/responses.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var shipping_address_mock_1 = require("./shipping-address.mock");
var actionTypes = require("./shipping-address-action-types");
var shipping_address_action_creator_1 = require("./shipping-address-action-creator");
describe('ShippingAddressActionCreator', function () {
    var address;
    var checkoutClient;
    var errorResponse;
    var response;
    var shippingAddressActionCreator;
    beforeEach(function () {
        response = responses_mock_1.getResponse(shipping_address_mock_1.getShippingAddressResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            updateShippingAddress: jest.fn(function () { return Promise.resolve(response); }),
        };
        shippingAddressActionCreator = new shipping_address_action_creator_1.default(checkoutClient);
        address = shipping_address_mock_1.getShippingAddress();
    });
    describe('#updateShippingAddress()', function () {
        it('emits actions if able to update shipping address', function () {
            shippingAddressActionCreator.updateAddress(address)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED },
                    { type: actionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to update shipping address', function () {
            checkoutClient.updateShippingAddress.mockImplementation(function () { return Promise.reject(errorResponse); });
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            shippingAddressActionCreator.updateAddress(address)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED },
                    { type: actionTypes.UPDATE_SHIPPING_ADDRESS_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
        it('sends request to update shipping address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingAddressActionCreator.updateAddress(address, {}).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.updateShippingAddress).toHaveBeenCalledWith(address, {});
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=shipping-address-action-creator.spec.js.map