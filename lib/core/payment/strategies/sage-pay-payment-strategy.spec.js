"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var payments_mock_1 = require("../payments.mock");
var orders_mock_1 = require("../../order/orders.mock");
var responses_mock_1 = require("../../../http-request/responses.mock");
var paymentStatusTypes = require("../payment-status-types");
var create_checkout_store_1 = require("../../create-checkout-store");
var sage_pay_payment_strategy_1 = require("./sage-pay-payment-strategy");
describe('SagePayPaymentStrategy', function () {
    var formPoster;
    var placeOrderService;
    var store;
    var strategy;
    beforeEach(function () {
        placeOrderService = {
            finalizeOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitPayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        formPoster = {
            postForm: jest.fn(function (url, data, callback) {
                if (callback === void 0) { callback = function () { }; }
                return callback();
            }),
        };
        store = create_checkout_store_1.default();
        strategy = new sage_pay_payment_strategy_1.default(store, placeOrderService, formPoster);
    });
    it('submits order without payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = orders_mock_1.getOrderRequestBody();
                    options = {};
                    return [4 /*yield*/, strategy.execute(payload, options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitOrder).toHaveBeenCalledWith(lodash_1.omit(payload, 'payment'), options);
                    return [2 /*return*/];
            }
        });
    }); });
    it('submits payment separately', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = orders_mock_1.getOrderRequestBody();
                    options = {};
                    return [4 /*yield*/, strategy.execute(payload, options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitPayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, options);
                    return [2 /*return*/];
            }
        });
    }); });
    it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var output;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, strategy.execute(orders_mock_1.getOrderRequestBody())];
                case 1:
                    output = _a.sent();
                    expect(output).toEqual(store.getState());
                    return [2 /*return*/];
            }
        });
    }); });
    it('posts 3ds data to Sage if 3ds is enabled', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var state;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = store.getState();
                    jest.spyOn(placeOrderService, 'submitPayment').mockReturnValue(Promise.reject(state));
                    jest.spyOn(state.errors, 'getSubmitOrderError').mockReturnValue(responses_mock_1.getResponse(tslib_1.__assign({}, payments_mock_1.getErrorPaymentResponseBody(), { errors: [
                            { code: 'three_d_secure_required' },
                        ], three_ds_result: {
                            acs_url: 'https://acs/url',
                            callback_url: 'https://callback/url',
                            payer_auth_request: 'payer_auth_request',
                            merchant_data: 'merchant_data',
                        }, status: 'error' })));
                    strategy.execute(orders_mock_1.getOrderRequestBody());
                    return [4 /*yield*/, new Promise(function (resolve) { return process.nextTick(resolve); })];
                case 1:
                    _a.sent();
                    expect(formPoster.postForm).toHaveBeenCalledWith('https://acs/url', {
                        PaReq: 'payer_auth_request',
                        TermUrl: 'https://callback/url',
                        MD: 'merchant_data',
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not post 3ds data to Sage if 3ds is not enabled', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var state, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = store.getState();
                    jest.spyOn(placeOrderService, 'submitPayment').mockReturnValue(Promise.reject(state));
                    jest.spyOn(state.errors, 'getSubmitOrderError').mockReturnValue(responses_mock_1.getResponse(payments_mock_1.getErrorPaymentResponseBody()));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, strategy.execute(orders_mock_1.getOrderRequestBody())];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    expect(formPoster.postForm).not.toHaveBeenCalled();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('finalizes order if order is created and payment is finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var checkout;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkout = store.getState().checkout;
                    jest.spyOn(checkout, 'getOrder').mockReturnValue(lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                        payment: {
                            status: paymentStatusTypes.FINALIZE,
                        },
                    }));
                    return [4 /*yield*/, strategy.finalize()];
                case 1:
                    _a.sent();
                    expect(placeOrderService.finalizeOrder).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not finalize order if order is not created', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var checkout;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkout = store.getState().checkout;
                    jest.spyOn(checkout, 'getOrder').mockReturnValue(orders_mock_1.getIncompleteOrder());
                    return [4 /*yield*/, strategy.finalize()];
                case 1:
                    _a.sent();
                    expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not finalize order if order is not finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var checkout;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkout = store.getState().checkout;
                    jest.spyOn(checkout, 'getOrder').mockReturnValue(lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                        payment: {
                            status: paymentStatusTypes.INITIALIZE,
                        },
                    }));
                    return [4 /*yield*/, strategy.finalize()];
                case 1:
                    _a.sent();
                    expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=sage-pay-payment-strategy.spec.js.map