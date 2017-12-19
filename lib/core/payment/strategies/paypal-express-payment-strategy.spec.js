"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var orders_mock_1 = require("../../order/orders.mock");
var payment_methods_mock_1 = require("../payment-methods.mock");
var paymentStatusTypes = require("../payment-status-types");
var create_checkout_store_1 = require("../../create-checkout-store");
var paypal_express_payment_strategy_1 = require("./paypal-express-payment-strategy");
describe('PaypalExpressPaymentStrategy', function () {
    var paypalSdk;
    var placeOrderService;
    var scriptLoader;
    var store;
    var strategy;
    beforeEach(function () {
        placeOrderService = {
            finalizeOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            verifyCart: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitOrder: jest.fn(function () { return Promise.resolve(store.getState()); }),
            submitPayment: jest.fn(function () { return Promise.resolve(store.getState()); }),
        };
        paypalSdk = {
            checkout: {
                setup: jest.fn(),
                initXO: jest.fn(),
                startFlow: jest.fn(function () {
                    setTimeout(function () {
                        var event = document.createEvent('Event');
                        event.initEvent('unload', true, false);
                        document.body.dispatchEvent(event);
                    });
                }),
                closeFlow: jest.fn(),
            },
        };
        scriptLoader = {
            loadScript: jest.fn(function () {
                window.paypal = paypalSdk;
                return Promise.resolve();
            }),
        };
        store = create_checkout_store_1.default();
        jest.spyOn(window.location, 'assign').mockImplementation(function () {
            setTimeout(function () {
                var event = document.createEvent('Event');
                event.initEvent('unload', true, false);
                document.body.dispatchEvent(event);
            });
        });
        strategy = new paypal_express_payment_strategy_1.default(store, placeOrderService, scriptLoader);
    });
    afterEach(function () {
        window.location.assign.mockReset();
    });
    describe('#initialize()', function () {
        var paymentMethod;
        beforeEach(function () {
            paymentMethod = payment_methods_mock_1.getPaypalExpress();
            jest.spyOn(store.getState().checkout, 'getPaymentMethod').mockImplementation(function (methodId) {
                return methodId === 'paypalexpress' ? paymentMethod : null;
            });
        });
        describe('if in-context checkout is enabled', function () {
            it('loads Paypal SDK', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            expect(scriptLoader.loadScript).toHaveBeenCalledWith('//www.paypalobjects.com/api/checkout.min.js');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('initializes Paypal SDK', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.setup).toHaveBeenCalledWith(paymentMethod.config.merchantId, {
                                button: 'paypal-button',
                                environment: 'production',
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var output;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            output = _a.sent();
                            expect(output).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('if in-context checkout is not enabled', function () {
            beforeEach(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    paymentMethod.config.merchantId = null;
                    return [2 /*return*/];
                });
            }); });
            it('does not load Paypal SDK', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            expect(scriptLoader.loadScript).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not initialize Paypal SDK', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.setup).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var output;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            output = _a.sent();
                            expect(output).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('#execute()', function () {
        var order;
        var payload;
        var paymentMethod;
        beforeEach(function () {
            payload = lodash_1.merge({}, orders_mock_1.getOrderRequestBody(), {
                payment: { name: 'paypalexpress' },
            });
            paymentMethod = payment_methods_mock_1.getPaypalExpress();
            order = lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                payment: {
                    id: 'paypalexpress',
                    redirectUrl: 'https://s1504075966.bcapp.dev/checkout',
                },
            });
            jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(order);
            jest.spyOn(store.getState().checkout, 'getPaymentMethod').mockImplementation(function (methodId) {
                return methodId === 'paypalexpress' ? paymentMethod : null;
            });
        });
        describe('if in-context checkout is enabled', function () {
            beforeEach(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('opens in-context modal', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.initXO).toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('starts in-context payment flow', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.startFlow).toHaveBeenCalledWith(order.payment.redirectUrl);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not open in-context modal if payment is already acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            order.payment.status = paymentStatusTypes.ACKNOWLEDGE;
                            return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                            expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not open in-context modal if payment is already finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            order.payment.status = paymentStatusTypes.FINALIZE;
                            return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                            expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('submits order with payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var options;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = {};
                            return [4 /*yield*/, strategy.execute(payload, options)];
                        case 1:
                            _a.sent();
                            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, true, options);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not submit payment data separately', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var options;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = {};
                            return [4 /*yield*/, strategy.execute(payload, options)];
                        case 1:
                            _a.sent();
                            expect(placeOrderService.submitPayment).not.toHaveBeenCalledWith(options);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not redirect shopper directly if order submission is successful', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(window.location.assign).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var output;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            output = _a.sent();
                            expect(output).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('if in-context checkout is not enabled', function () {
            beforeEach(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            paymentMethod.config.merchantId = null;
                            return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not open in-context modal', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.initXO).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not start in-context payment flow', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.startFlow).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('submits order with payment data', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var options;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = {};
                            return [4 /*yield*/, strategy.execute(payload, options)];
                        case 1:
                            _a.sent();
                            expect(placeOrderService.submitOrder).toHaveBeenCalledWith(payload, true, options);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not submit payment data separately', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(placeOrderService.submitPayment).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('redirects shopper directly if order submission is successful', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(window.location.assign).toHaveBeenCalledWith(order.payment.redirectUrl);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not redirect shopper if payment is already acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            order.payment.status = paymentStatusTypes.ACKNOWLEDGE;
                            return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(window.location.assign).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not redirect shopper if payment is already finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            order.payment.status = paymentStatusTypes.FINALIZE;
                            return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            _a.sent();
                            expect(window.location.assign).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var output;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.execute(payload)];
                        case 1:
                            output = _a.sent();
                            expect(output).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('#finalize()', function () {
        var order;
        var paymentMethod;
        beforeEach(function () {
            paymentMethod = payment_methods_mock_1.getPaypalExpress();
            order = lodash_1.merge({}, orders_mock_1.getSubmittedOrder(), {
                payment: {
                    id: 'paypalexpress',
                    redirectUrl: 'https://s1504075966.bcapp.dev/checkout',
                },
            });
            jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(order);
            jest.spyOn(store.getState().checkout, 'getPaymentMethod').mockImplementation(function (methodId) {
                return methodId === 'paypalexpress' ? paymentMethod : null;
            });
        });
        it('finalizes order if order is created and payment is acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        order.payment.status = paymentStatusTypes.ACKNOWLEDGE;
                        return [4 /*yield*/, strategy.finalize()];
                    case 1:
                        _a.sent();
                        expect(placeOrderService.finalizeOrder).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('finalizes order if order is created and payment is finalized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        order.payment.status = paymentStatusTypes.FINALIZE;
                        return [4 /*yield*/, strategy.finalize()];
                    case 1:
                        _a.sent();
                        expect(placeOrderService.finalizeOrder).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
        it('does not finalize order if order is not created', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, errors;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        jest.spyOn(store.getState().checkout, 'getOrder').mockReturnValue(orders_mock_1.getIncompleteOrder());
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, strategy.finalize()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        errors = _a.errors;
                        expect(errors.getFinalizeOrderError()).toBeUndefined();
                        expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        it('does not finalize order if order is not finalized or acknowledged', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, errors;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, strategy.finalize()];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        errors = _a.errors;
                        expect(errors.getFinalizeOrderError()).toBeUndefined();
                        expect(placeOrderService.finalizeOrder).not.toHaveBeenCalled();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('#deinitialize()', function () {
        var paymentMethod;
        beforeEach(function () {
            paymentMethod = payment_methods_mock_1.getPaypalExpress();
            jest.spyOn(store.getState().checkout, 'getPaymentMethod').mockImplementation(function (methodId) {
                return methodId === 'paypalexpress' ? paymentMethod : null;
            });
        });
        describe('if in-context checkout is enabled', function () {
            it('ends paypal flow', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, strategy.deinitialize()];
                        case 2:
                            _a.sent();
                            expect(paypalSdk.checkout.closeFlow).toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('does not end paypal flow if it is not initialized', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.deinitialize()];
                        case 1:
                            _a.sent();
                            expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = expect;
                            return [4 /*yield*/, strategy.deinitialize()];
                        case 1:
                            _a.apply(void 0, [_b.sent()]).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('if in-context checkout is not enabled', function () {
            beforeEach(function () {
                paymentMethod.config.merchantId = null;
            });
            it('does not end paypal flow', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, strategy.initialize()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, strategy.deinitialize()];
                        case 2:
                            _a.sent();
                            expect(paypalSdk.checkout.closeFlow).not.toHaveBeenCalled();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns checkout state', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = expect;
                            return [4 /*yield*/, strategy.deinitialize()];
                        case 1:
                            _a.apply(void 0, [_b.sent()]).toEqual(store.getState());
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
//# sourceMappingURL=paypal-express-payment-strategy.spec.js.map