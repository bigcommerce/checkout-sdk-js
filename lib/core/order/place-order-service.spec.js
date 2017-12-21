"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var data_store_1 = require("../../data-store");
var http_request_1 = require("../../http-request");
var carts_mock_1 = require("../cart/carts.mock");
var configs_mock_1 = require("../config/configs.mock");
var customers_mock_1 = require("../customer/customers.mock");
var orders_mock_1 = require("./orders.mock");
var payments_mock_1 = require("../payment/payments.mock");
var payment_methods_mock_1 = require("../payment/payment-methods.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_options_mock_1 = require("../shipping/shipping-options.mock");
var orders_mock_2 = require("../order/orders.mock");
var paymentStatusTypes = require("../payment/payment-status-types");
var create_checkout_store_1 = require("../create-checkout-store");
var place_order_service_1 = require("./place-order-service");
describe('PlaceOrderService', function () {
    var orderActionCreator;
    var paymentActionCreator;
    var placeOrderService;
    var store;
    beforeEach(function () {
        orderActionCreator = {
            finalizeOrder: jest.fn(function () { return data_store_1.createAction('FINALIZE_ORDER'); }),
            loadOrder: jest.fn(function () { return data_store_1.createAction('LOAD_ORDER'); }),
            submitOrder: jest.fn(function () { return data_store_1.createAction('SUBMIT_ORDER'); }),
        };
        paymentActionCreator = {
            initializeOffsitePayment: jest.fn(function () { return data_store_1.createAction('INITALIZE_OFFSITE_PAYMENT'); }),
            submitPayment: jest.fn(function () { return data_store_1.createAction('SUBMIT_PAYMENT'); }),
        };
        store = create_checkout_store_1.default({
            cart: carts_mock_1.getCartState(),
            config: configs_mock_1.getConfigState(),
            customer: customers_mock_1.getCustomerState(),
            order: orders_mock_2.getSubmittedOrderState(),
            quote: quotes_mock_1.getQuoteState(),
            paymentMethods: payment_methods_mock_1.getPaymentMethodsState(),
            shippingOptions: shipping_options_mock_1.getShippingOptionsState(),
        });
        placeOrderService = new place_order_service_1.default(store, orderActionCreator, paymentActionCreator);
    });
    describe('#submitOrder()', function () {
        it('dispatches submit order action', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, placeOrderService.submitOrder(orders_mock_1.getOrderRequestBody(), false)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), undefined, undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('SUBMIT_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches submit order action with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, placeOrderService.submitOrder(orders_mock_1.getOrderRequestBody(), false, options)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), undefined, options);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('SUBMIT_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches submit order action with cart if should verify cart', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        checkout = store.getState().checkout;
                        return [4 /*yield*/, placeOrderService.submitOrder(orders_mock_1.getOrderRequestBody(), true)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(orders_mock_1.getOrderRequestBody(), checkout.getCart(), undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('SUBMIT_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, placeOrderService.submitOrder(orders_mock_1.getOrderRequestBody())];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(store.getState());
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#finalizeOrder()', function () {
        it('dispatches finalize order action', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, placeOrderService.finalizeOrder(295)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(295, undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('FINALIZE_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches finalize order action with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, placeOrderService.finalizeOrder(295, options)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.finalizeOrder).toHaveBeenCalledWith(295, options);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('FINALIZE_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, placeOrderService.finalizeOrder(295)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(store.getState());
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#submitPayment()', function () {
        it('dispatches submit payment action', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment())];
                    case 1:
                        _a.sent();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining(payments_mock_1.getPaymentRequestBody()), undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('SUBMIT_PAYMENT'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches submit payment action with device session id if provided', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, placeOrderService.submitPayment(lodash_1.merge(payments_mock_1.getPayment(), { paymentData: { deviceSessionId: 'ccc2156e-68d4-47f0-b311-d9b21e89df5d' } }))];
                    case 1:
                        _a.sent();
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining(lodash_1.merge(payments_mock_1.getPaymentRequestBody(), {
                            quoteMeta: {
                                request: {
                                    deviceSessionId: 'ccc2156e-68d4-47f0-b311-d9b21e89df5d',
                                },
                            },
                        })), undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('SUBMIT_PAYMENT'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('dispatches load order action', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment())];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.loadOrder).toHaveBeenCalledWith(orders_mock_1.getCompleteOrder().orderId, undefined);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('LOAD_ORDER'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('create actions with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment(), false, options)];
                    case 1:
                        _a.sent();
                        expect(orderActionCreator.loadOrder).toHaveBeenCalledWith(orders_mock_1.getCompleteOrder().orderId, options);
                        expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expect.objectContaining(payments_mock_1.getPaymentRequestBody()), options);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment())];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(store.getState());
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not submit payment data if payment is not required', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkout = store.getState().checkout;
                        jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(false);
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment(), true)];
                    case 1:
                        _a.sent();
                        expect(checkout.isPaymentDataRequired).toHaveBeenCalledWith(true);
                        expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not submit payment data if payment is acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkout = store.getState().checkout;
                        jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(true);
                        jest.spyOn(checkout, 'getOrder').mockReturnValue(tslib_1.__assign({}, orders_mock_1.getIncompleteOrder(), { payment: {
                                status: paymentStatusTypes.ACKNOWLEDGE,
                            } }));
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment(), true)];
                    case 1:
                        _a.sent();
                        expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not submit payment data if payment is finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkout = store.getState().checkout;
                        jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(true);
                        jest.spyOn(checkout, 'getOrder').mockReturnValue(tslib_1.__assign({}, orders_mock_1.getIncompleteOrder(), { payment: {
                                status: paymentStatusTypes.FINALIZE,
                            } }));
                        return [4 /*yield*/, placeOrderService.submitPayment(payments_mock_1.getPayment(), true)];
                    case 1:
                        _a.sent();
                        expect(paymentActionCreator.submitPayment).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#initializeOffsitePayment()', function () {
        it('dispatches finalize payment action', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        jest.spyOn(store, 'dispatch');
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, placeOrderService.initializeOffsitePayment(payments_mock_1.getPayment(), false, options)];
                    case 1:
                        _a.sent();
                        expect(paymentActionCreator.initializeOffsitePayment).toHaveBeenCalledWith(expect.objectContaining(payments_mock_1.getPaymentRequestBody()), options);
                        expect(store.dispatch).toHaveBeenCalledWith(data_store_1.createAction('INITALIZE_OFFSITE_PAYMENT'));
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, placeOrderService.initializeOffsitePayment(payments_mock_1.getPayment(), false)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(store.getState());
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not submit payment data if payment is not required', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var checkout;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkout = store.getState().checkout;
                        jest.spyOn(checkout, 'isPaymentDataRequired').mockReturnValue(false);
                        return [4 /*yield*/, placeOrderService.initializeOffsitePayment(payments_mock_1.getPayment(), true)];
                    case 1:
                        _a.sent();
                        expect(checkout.isPaymentDataRequired).toHaveBeenCalledWith(true);
                        expect(paymentActionCreator.initializeOffsitePayment).not.toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=place-order-service.spec.js.map