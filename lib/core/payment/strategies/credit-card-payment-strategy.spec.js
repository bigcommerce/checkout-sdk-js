"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var orders_mock_1 = require("../../order/orders.mock");
var create_checkout_store_1 = require("../../create-checkout-store");
var credit_card_payment_strategy_1 = require("./credit-card-payment-strategy");
describe('CreditCardPaymentStrategy', function () {
    var placeOrderService;
    var store;
    var strategy;
    beforeEach(function () {
        placeOrderService = {
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitPayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        store = create_checkout_store_1.default();
        strategy = new credit_card_payment_strategy_1.default(store, placeOrderService);
    });
    it('submits order without payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = orders_mock_1.getOrderRequestBody();
                    return [4 /*yield*/, strategy.execute(payload)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitOrder).toHaveBeenCalledWith(lodash_1.omit(payload, 'payment'), undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    it('submits payment separately', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var payload;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = orders_mock_1.getOrderRequestBody();
                    return [4 /*yield*/, strategy.execute(payload)];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitPayment).toHaveBeenCalledWith(payload.payment, payload.useStoreCredit, undefined);
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
//# sourceMappingURL=credit-card-payment-strategy.spec.js.map