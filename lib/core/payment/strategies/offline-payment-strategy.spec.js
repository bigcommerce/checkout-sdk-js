"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var orders_mock_1 = require("../../order/orders.mock");
var create_checkout_store_1 = require("../../create-checkout-store");
var offline_payment_strategy_1 = require("./offline-payment-strategy");
describe('OfflinePaymentStrategy', function () {
    var placeOrderService;
    var store;
    var strategy;
    beforeEach(function () {
        store = create_checkout_store_1.default();
        placeOrderService = {
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            initializeOffsitePayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        strategy = new offline_payment_strategy_1.default(store, placeOrderService);
    });
    it('submits order without payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, strategy.execute(orders_mock_1.getOrderRequestBody())];
                case 1:
                    _a.sent();
                    expect(placeOrderService.submitOrder).toHaveBeenCalledWith(tslib_1.__assign({}, orders_mock_1.getOrderRequestBody(), { payment: {
                            name: 'authorizenet',
                        } }), undefined);
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
//# sourceMappingURL=offline-payment-strategy.spec.js.map