"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var orders_mock_1 = require("./orders.mock");
var carts_mock_1 = require("../cart/carts.mock");
var configs_mock_1 = require("../config/configs.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./order-action-types");
var create_checkout_store_1 = require("../create-checkout-store");
var order_action_creator_1 = require("./order-action-creator");
describe('OrderActionCreator', function () {
    var checkoutClient;
    var orderActionCreator;
    var store;
    beforeEach(function () {
        store = create_checkout_store_1.default({
            config: configs_mock_1.getConfigState(),
        });
        jest.spyOn(store, 'dispatch');
    });
    describe('#loadOrder()', function () {
        var errorResponse;
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
            checkoutClient = {
                loadOrder: jest.fn(function () { return Promise.resolve(response); }),
            };
            orderActionCreator = new order_action_creator_1.default(checkoutClient);
        });
        it('emits actions if able to load order', function () {
            orderActionCreator.loadOrder(295)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_ORDER_REQUESTED },
                    { type: actionTypes.LOAD_ORDER_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits actions if unable to load order', function () {
            checkoutClient.loadOrder.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            orderActionCreator.loadOrder()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_ORDER_REQUESTED },
                    { type: actionTypes.LOAD_ORDER_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
    describe('#submitOrder()', function () {
        var errorResponse;
        var loadResponse;
        var submitResponse;
        beforeEach(function () {
            loadResponse = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            submitResponse = responses_mock_1.getResponse(orders_mock_1.getSubmitOrderResponseBody(), orders_mock_1.getSubmitOrderResponseHeaders());
            errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
            checkoutClient = {
                loadCart: jest.fn(function () { return Promise.resolve(responses_mock_1.getResponse(carts_mock_1.getCartResponseBody())); }),
                loadOrder: jest.fn(function () { return Promise.resolve(loadResponse); }),
                submitOrder: jest.fn(function () { return Promise.resolve(submitResponse); }),
            };
            orderActionCreator = new order_action_creator_1.default(checkoutClient);
        });
        it('emits actions if able to submit order', function () {
            orderActionCreator.submitOrder(orders_mock_1.getOrderRequestBody())
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.SUBMIT_ORDER_REQUESTED },
                    {
                        type: actionTypes.SUBMIT_ORDER_SUCCEEDED,
                        payload: submitResponse.body.data,
                        meta: tslib_1.__assign({}, submitResponse.body.meta, { token: submitResponse.headers.token }),
                    },
                ]);
            });
        });
        it('emits error actions if unable to submit order', function () {
            checkoutClient.submitOrder.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            orderActionCreator.submitOrder(orders_mock_1.getOrderRequestBody())
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.SUBMIT_ORDER_REQUESTED },
                    { type: actionTypes.SUBMIT_ORDER_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
        it('verifies cart content', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orderActionCreator.submitOrder(orders_mock_1.getOrderRequestBody(), carts_mock_1.getCart()).toPromise()];
                    case 1:
                        _a.sent();
                        expect(checkoutClient.loadCart).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not submit order if cart verification fails', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var action_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, orderActionCreator.submitOrder(orders_mock_1.getOrderRequestBody(), tslib_1.__assign({}, carts_mock_1.getCart(), { currency: 'JPY' })).toPromise()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        action_1 = _a.sent();
                        expect(checkoutClient.submitOrder).not.toHaveBeenCalled();
                        expect(action_1.payload.body.type).toEqual('changed_cart');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#finalizeOrder()', function () {
        var errorResponse;
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(orders_mock_1.getCompleteOrderResponseBody());
            errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
            checkoutClient = {
                finalizeOrder: jest.fn(function () { return Promise.resolve(response); }),
            };
            orderActionCreator = new order_action_creator_1.default(checkoutClient);
        });
        it('emits actions if able to finalize order', function () {
            orderActionCreator.finalizeOrder(295)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.FINALIZE_ORDER_REQUESTED },
                    { type: actionTypes.FINALIZE_ORDER_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to finalize order', function () {
            checkoutClient.finalizeOrder.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            orderActionCreator.finalizeOrder()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.FINALIZE_ORDER_REQUESTED },
                    { type: actionTypes.FINALIZE_ORDER_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=order-action-creator.spec.js.map