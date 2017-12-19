"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orders_mock_1 = require("../../order/orders.mock");
var create_checkout_store_1 = require("../../create-checkout-store");
var legacy_payment_strategy_1 = require("./legacy-payment-strategy");
describe('LegacyPaymentStrategy', function () {
    var placeOrderService;
    var store;
    var strategy;
    beforeEach(function () {
        store = create_checkout_store_1.default();
        placeOrderService = {
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitPayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        strategy = new legacy_payment_strategy_1.default(store, placeOrderService);
    });
    it('submits order with payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, strategy.execute(orders_mock_1.getOrderRequestBody())];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitOrder).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not submit payment data separately', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, strategy.execute(orders_mock_1.getOrderRequestBody())];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
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
//# sourceMappingURL=legacy-payment-strategy.spec.js.map