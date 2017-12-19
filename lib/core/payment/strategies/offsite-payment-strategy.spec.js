"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orders_mock_1 = require("../../order/orders.mock");
var lodash_1 = require("lodash");
var paymentStatusTypes = require("../payment-status-types");
var create_checkout_store_1 = require("../../create-checkout-store");
var offsite_payment_strategy_1 = require("./offsite-payment-strategy");
describe('OffsitePaymentStrategy', function () {
    var placeOrderService;
    var store;
    var strategy;
    beforeEach(function () {
        store = create_checkout_store_1.default();
        placeOrderService = {
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            finalizeOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            initializeOffsitePayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        strategy = new offsite_payment_strategy_1.default(store, placeOrderService);
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
    it('submits order with payment data if payment gateway is "adyen"', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = lodash_1.merge({}, orders_mock_1.getOrderRequestBody(), {
                        payment: { name: 'amex', gateway: 'adyen' },
                    });
                    options = {};
                    return [4 /*yield*/, strategy.execute(payload, options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, options);
                    return [2 /*return*/];
            }
        });
    }); });
    it('initializes offsite payment flow', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = orders_mock_1.getOrderRequestBody();
                    options = {};
                    return [4 /*yield*/, strategy.execute(payload, options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.initializeOffsitePayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, options);
                    return [2 /*return*/];
            }
        });
    }); });
    it('finalizes order if order is created and payment is acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var checkout, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkout = store.getState().checkout;
                    options = {};
                    jest.spyOn(checkout, 'getOrder').mockReturnValue(lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                        payment: {
                            status: paymentStatusTypes.ACKNOWLEDGE,
                        },
                    }));
                    return [4 /*yield*/, strategy.finalize(options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.finalizeOrder).toHaveBeenCalledWith(checkout.getOrder().orderId, options);
                    return [2 /*return*/];
            }
        });
    }); });
    it('finalizes order if order is created and payment is finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var checkout, options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkout = store.getState().checkout;
                    options = {};
                    jest.spyOn(checkout, 'getOrder').mockReturnValue(lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                        payment: {
                            status: paymentStatusTypes.FINALIZE,
                        },
                    }));
                    return [4 /*yield*/, strategy.finalize(options)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.finalizeOrder).toHaveBeenCalledWith(checkout.getOrder().orderId, options);
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
    it('does not finalize order if order is not finalized or acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
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
});
//# sourceMappingURL=offsite-payment-strategy.spec.js.map