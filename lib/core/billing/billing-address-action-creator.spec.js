"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var responses_mock_1 = require("../../http-request/responses.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var billing_address_mock_1 = require("./billing-address.mock");
var actionTypes = require("./billing-address-action-types");
var billing_address_action_creator_1 = require("./billing-address-action-creator");
describe('BillingAddressActionCreator', function () {
    var address;
    var billingAddressActionCreator;
    var checkoutClient;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse(billing_address_mock_1.getBillingAddressResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            updateBillingAddress: jest.fn(function () { return Promise.resolve(response); }),
        };
        billingAddressActionCreator = new billing_address_action_creator_1.default(checkoutClient);
        address = billing_address_mock_1.getBillingAddress();
    });
    describe('#updateBillingAddress()', function () {
        it('emits actions if able to update billing address', function () {
            billingAddressActionCreator.updateAddress(address)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED },
                    { type: actionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to update billing address', function () {
            checkoutClient.updateBillingAddress.mockImplementation(function () { return Promise.reject(errorResponse); });
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            billingAddressActionCreator.updateAddress(address)
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED },
                    { type: actionTypes.UPDATE_BILLING_ADDRESS_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
        it('sends request to update billing address', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, billingAddressActionCreator.updateAddress(address, {}).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.updateBillingAddress).toHaveBeenCalledWith(address, {});
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=billing-address-action-creator.spec.js.map